import { describe, expect, it } from "vitest";
import { simulateInteractionTimeline } from "./ode-solver";

describe("ODE interaction solver", () => {
  it("returns zero risk when no interaction warning exists", () => {
    const result = simulateInteractionTimeline("Metformin", "Aspirin", false, 1200, 450, 48);

    expect(result.peakRiskScore).toBe(0);
    expect(result.severityClass).toBe("none");
    expect(result.riskScores.every((score) => score === 0)).toBe(true);
  });

  it("simulates non-zero risk when interaction warning exists", () => {
    const result = simulateInteractionTimeline("Warfarin", "Aspirin", true, 120, 450, 48, 0.5);

    expect(result.peakRiskScore).toBeGreaterThan(0);
    expect(result.peakRiskTime).toBeGreaterThanOrEqual(0);
    expect(result.riskScores.length).toBeGreaterThan(0);
    expect(result.severityClass).toMatch(/none|mild|moderate|severe/);
  });

  it("produces deterministic output given same input parameters", () => {
    const params = ["Drug A", "Drug B", true, 300, 250, 48, 0.4] as const;

    const first = simulateInteractionTimeline(...params);
    const second = simulateInteractionTimeline(...params);

    expect(first.peakRiskScore).toBe(second.peakRiskScore);
    expect(first.riskScores).toEqual(second.riskScores);
  });

  it("classifies severe interaction correctly", () => {
    const result = simulateInteractionTimeline("Drug1", "Drug2", true, 100, 100, 48, 0.8);

    expect(result.peakRiskScore).toBeGreaterThan(50);
    expect(["moderate", "severe"]).toContain(result.severityClass);
  });

  it("captures time-to-peak-risk and risk thresholds", () => {
    const result = simulateInteractionTimeline("Drug1", "Drug2", true, 800, 600, 48, 0.5);

    expect(result.timePoints.length).toBeGreaterThan(0);
    expect(result.peakRiskTime).toBeGreaterThanOrEqual(0);

    if (result.timeToMildRisk !== null) {
      expect(result.timeToMildRisk).toBeLessThanOrEqual(result.peakRiskTime);
    }
  });
});
