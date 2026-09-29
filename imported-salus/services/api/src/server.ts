import { serve } from "@hono/node-server";
import net from "node:net";
import { app } from "./app";

const port = Number(process.env.PORT || 8787);

function isPortAvailable(candidatePort: number): Promise<boolean> {
	return new Promise((resolve) => {
		const tester = net.createServer();

		tester.once("error", () => resolve(false));
		tester.once("listening", () => {
			tester.close(() => resolve(true));
		});

		tester.listen(candidatePort);
	});
}

async function main() {
	const available = await isPortAvailable(port);

	if (!available) {
		console.log(`evidence-api not started: port ${port} already in use (assuming another API instance is running)`);
		// Keep dev task alive so parallel npm scripts do not fail when API already exists.
		await new Promise(() => undefined);
		return;
	}

	serve({ fetch: app.fetch, port });
	console.log(`evidence-api listening on http://localhost:${port}`);
}

main().catch((error) => {
	console.error("Failed to start API server", error);
	process.exitCode = 1;
});
