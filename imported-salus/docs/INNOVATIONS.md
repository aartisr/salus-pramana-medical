# SALUS Innovations Catalog

Updated: 2026-07-04

## Purpose

This document lists the major innovations implemented in this repository, with concise notes on why each is meaningful.

## Core Product Innovations

- Cross-system evidence parity layer: compares Allopathy, Ayurveda, Siddha, and Naturopathy without collapsing them into false equivalence, and surfaces explicit non-equivalency guardrails in UI and API metadata.
- Evidence-first ranking with transparent rationale: ranks interventions with confidence, benefit, risk, freshness, and a human-readable rank reason so scoring is inspectable.
- Persona-adaptive decision framing: Patient, Clinician, and Researcher modes alter explanation depth without changing the underlying evidence.
- High-signal dashboard composition: condition selection, goals, safety context, side-by-side system compare, confidence ladder, and interaction trajectories are integrated into one workflow.

## Calculus and Intelligence Innovations

- Deterministic Pramana intelligence engine: computes condition and evidence intelligence with deterministic weighting, confidence intervals, Bayesian thresholding, and explicit contribution rows.
- ODE-based interaction simulation: uses a Runge-Kutta ODE model to generate time-series interaction risk and effect trajectories.
- Single-intervention trajectory simulation: models intervention response over time with kinetics-style trajectory behavior and peak timing insight.
- Dose-response optimizer: generates dose candidates with efficacy-risk tradeoff and net-benefit logic for actionable guidance.
- Governance gating for recommendation safety: applies condition-level validation gates (calibration proxy, interval reliability proxy, citation coverage, recency coverage) with GO/NO-GO signaling.

## Explainability and Visualization Innovations

- Top-5 clinical value decomposition chart: decomposes each top intervention into confidence base, freshness bonus, and risk penalty with explicit score math.
- Persona sensitivity ranking simulation: offers profile toggles (persona default, risk conservative, risk neutral, risk tolerant) and shows rank shifts from baseline.
- Multi-layer confidence and risk storytelling: combines ladder, sparkline, quadrant, freshness timeline, and safety views for both fast triage and deep analysis.

## Data Integrity and Editorial Workflow Innovations

- Strong domain validation contract: centralized Zod schemas enforce evidence grade constraints, registry identifier prefixes, URL validity, and typed safety fields.
- Editorial status workflow with role controls: supports draft/published/rejected lifecycle with authenticated editor controls and audit logging.
- Search, pagination, and CSV export with metadata: provides cursor pagination, full-text filtering, CSV export, and causal-equivalency metadata in API responses.

## Platform and Operational Innovations

- Correlation-ID observability path: API emits request lifecycle logs with correlation IDs, and frontend error messages surface reference IDs for support.
- Route-level lazy loading and modular composition: web routes are lazy loaded and app shell/pages are separated; API routes are modularized by domain.
- Synthetic calibration and drift scaffolding: includes calibration report generation and drift monitoring scaffolding for model operations.
- Serverless-ready AWS baseline with guardrails: SAM template includes Lambda, DynamoDB, Cognito, CloudFront/S3, schedules, and budget-aware controls.

## Why this set is differentiated

SALUS combines cross-tradition evidence representation, deterministic and inspectable intelligence, governance gates, operational traceability, and modular production architecture in one system. Most evidence tools emphasize either visualization or modeling; SALUS unifies modeling, governance, explainability, and deployable engineering discipline.
