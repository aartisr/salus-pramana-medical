import https from "node:https";
import { URL } from "node:url";
import type { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { ensureSeedData } from "./repository";

type CfnStatus = "SUCCESS" | "FAILED";

async function sendCloudFormationResponse(
  event: CloudFormationCustomResourceEvent,
  context: Context,
  status: CfnStatus,
  reason: string,
  data: Record<string, unknown> = {},
  physicalResourceId?: string,
) {
  const responseUrl = new URL(event.ResponseURL);
  const body = JSON.stringify({
    Status: status,
    Reason: `${reason} (log: ${context.logStreamName})`,
    PhysicalResourceId: physicalResourceId ?? `seed-data-${event.LogicalResourceId}`,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: data,
  });

  await new Promise<void>((resolve, reject) => {
    const request = https.request(
      {
        hostname: responseUrl.hostname,
        path: `${responseUrl.pathname}${responseUrl.search}`,
        method: "PUT",
        headers: {
          "content-type": "",
          "content-length": Buffer.byteLength(body),
        },
      },
      (response) => {
        response.on("data", () => {});
        response.on("end", resolve);
      },
    );

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

export async function handler(event: CloudFormationCustomResourceEvent, context: Context) {
  try {
    if (event.RequestType === "Delete") {
      await sendCloudFormationResponse(event, context, "SUCCESS", "No action needed on delete", {
        deleted: true,
      });
      return;
    }

    const result = await ensureSeedData();

    await sendCloudFormationResponse(event, context, "SUCCESS", "Seed data ensured", {
      mode: result.mode,
      conditionsSeeded: result.conditionsSeeded,
      evidenceSeeded: result.evidenceSeeded,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown seeding failure";
    await sendCloudFormationResponse(event, context, "FAILED", message, {
      error: message,
    });
  }
}
