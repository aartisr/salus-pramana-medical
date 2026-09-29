import { describe, expect, it } from "vitest";
import {
  extractAyushRefs,
  extractClinicalTrialsSourceTimestamp,
  extractCtriRefs,
  extractNctIds,
  extractSourceTimestamp,
} from "./shared/source-parsers";

describe("source parser helpers", () => {
  it("extracts nct ids from ClinicalTrials payload", () => {
    const payload = {
      studies: [
        { protocolSection: { identificationModule: { nctId: "NCT00000001" } } },
        { protocolSection: { identificationModule: { nctId: "NCT00000002" } } },
      ],
    };

    expect(extractNctIds(payload)).toEqual(["NCT00000001", "NCT00000002"]);
  });

  it("extracts ayush refs from rows or records", () => {
    const payload = { rows: [{ registryIdentifier: "AYUSH-1" }, { id: "DHARA-2" }] };
    expect(extractAyushRefs(payload)).toEqual(["AYUSH-1", "DHARA-2"]);
  });

  it("extracts ctri refs from trials or records", () => {
    const payload = { trials: [{ reference: "CTRI/2024/01/001" }, { id: "ICTRP-IND-1" }] };
    expect(extractCtriRefs(payload)).toEqual(["CTRI/2024/01/001", "ICTRP-IND-1"]);
  });

  it("extracts latest clinicaltrials source timestamp", () => {
    const payload = {
      studies: [
        { protocolSection: { statusModule: { lastUpdatePostDateStruct: { date: "2024-02-10" } } } },
        { protocolSection: { statusModule: { lastUpdateSubmitDateStruct: { date: "2024-05-11" } } } },
      ],
    };

    expect(extractClinicalTrialsSourceTimestamp(payload)).toBe("2024-05-11T00:00:00.000Z");
  });

  it("extracts source timestamp from metadata and records", () => {
    const payload = {
      metadata: { lastUpdated: "2024-06-02T10:15:00Z" },
      records: [{ id: "A", updatedAt: "2024-06-01T03:10:00Z" }],
    };

    expect(extractSourceTimestamp(payload)).toBe("2024-06-02T10:15:00.000Z");
  });
});
