# SLEDGE2WORTH

Stage 4 hackathon decision-support prototype: validated batch input, browser-only CSV import and explainable, rule-based reuse screening. All screening thresholds are explicitly invented demonstration assumptions, not regulatory limits. No reuse certification or trained AI model is provided.

## Run in VS Code on Windows
Open this Desktop IEEE HACKBATTLE/sludgesense folder. Node.js LTS >=20.9 and npm are required.

```powershell
npm.cmd ci
npm.cmd run dev -- --port 3101
```

Open http://localhost:3101. No API key or environment file is needed. Use npm.cmd/npx.cmd in restricted PowerShell; do not change execution policy. Stop the server with Ctrl+C.

## Try the demonstration
1. Choose SYN-CANDIDATE near the top of Batch assessment.
2. Run demo screening. Three candidate pathways and one preparation barrier appear.
3. Select Metals, change lead to 500, and rerun. Known hard exclusions appear.
4. Open Inspect evidence and barriers, then expand the criteria to see values, units, rules, reasons and provenance.
5. Choose SYN-TREATMENT for evaluation barriers or SYN-MISSING for insufficient data.
6. For CSV, download Screening samples, choose that file, load the validated batches and select one. CSV and manual entry use the same engine.

Changes mark previous results stale. Refreshing clears all session data. Imported repeat observations are retained. A candidate result means only that the limited demo gates pass; every pathway lists real-world requirements that remain unassessed.

## Implemented
- Batch metadata and all 23 agreed parameter identifiers.
- Shared input validation, unit checks and missing-context warnings.
- CSV template, incomplete example, full screening samples, row errors, 1 MB / 1000-row limits, batch selection.
- Four independent pathway statuses, criteria traces, known barriers, missing evidence and unassessed requirements.
- Versioned profile separated from the deterministic screening engine.
- Responsive layouts and explicit stale-state feedback.

## Checks
```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```
For production preview after building: npm.cmd start -- --port 3101 (stop the development server first). GET /api/health reports stage 4 and regulatoryAssessment false.

## Project map
src/app: workspace and health endpoint.
src/components: import and screening evidence views.
src/lib/validation: common validator and CSV parser.
src/lib/screening/profile.ts: illustrative thresholds, rationale and provenance.
src/lib/screening/index.ts: deterministic, independent pathway evaluation.
src/lib/demo.ts: synthetic samples.
docs/DATA_REQUIREMENTS.md: agreed measurements.
docs/STAGE_3.md: CSV schema and input validation.
docs/STAGE_4.md: screening specification, limitations and demo walkthrough.

## Next stages
Stage 5: researched treatment considerations and simulated value comparisons.
Stage 6: optional server-side AI explanations that cannot override rules.
Stage 7: report export and final verification.
No authentication, database, payment, IoT, marketplace, AI calls, or treatment calculations are included today.

## GitHub and Vercel
No publication/deployment has been performed. Commit source, lockfile, docs and synthetic fixtures through VS Code Source Control when ready. Exclude node_modules, .next, .test-build and real environment files or credentials. .env.example contains placeholders for later optional AI integration.

Four built-in samples: SYN-CANDIDATE, SYN-TREATMENT, SYN-EXCLUDED (lead 500 mg/kg; all pathways excluded under demo criteria), and SYN-MISSING. The selector and Screening samples CSV use identical data.


