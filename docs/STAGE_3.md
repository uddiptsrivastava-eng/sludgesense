# Stage 3 — validated input and CSV

## CSV format
Download template.csv or synthetic-batches.csv from the app. UTF-8 CSV, one observation per row; repeat batch metadata exactly for all rows of a batch. All 13 headers are required, in any order:

batch_id,sampled_at,treatment_history,parameter,value,unit,basis,method,analyte,qualifier,detection_limit,provenance,notes

Use parameter identifiers from src/lib/parameters.ts (e.g. moisture, totalSolids, lead, eColi). Dates are YYYY-MM-DD or blank. Leave unknown values blank, never substitute zero. Multiple rows for a parameter are retained as separate observations.

Qualifiers: measured, lessThan, greaterThan, notDetected, notMeasured. A blank qualifier is inferred as measured for a supplied value, otherwise notMeasured. Non-detects require a blank value; provide detection_limit separately if known. Provenance must be laboratory, userReported, synthetic or derived. Import provenance is a user assertion, not proof of laboratory origin.

## Supported unit vocabulary
- Moisture, total solids, volatile solids, organic matter: %.
- pH: pH. Quantity: kg, tonne, L, m3. C:N: ratio.
- Metals: mg/kg, ug/kg.
- Biological: CFU/g, MPN/g, eggs/g, ova/g.
- TOC and nutrients: %, g/kg, mg/kg.

Units are case-sensitive; unsupported units are rejected with no conversions. Blank units, basis, or biological test context produce warnings. Basis and method are retained as reported text, not scientifically validated. These formatting checks are not regulatory limits or a completeness determination.

## Limits and behavior
Browser-only parsing, maximum 1 MB and 1000 nonblank observation records. Supports quoted commas, escaped quotes, embedded newlines, CRLF, UTF-8 BOM. Any error blocks the whole import. Preview shows row errors, warnings, batch counts and observation counts. Loading replaces the draft. The selector loads original imported batches; switching replaces unsaved draft edits. Additional observations beyond the first per parameter are retained read-only and revalidated; edit and reimport the CSV to change them. First observations remain editable. Manual edits mark non-synthetic values userReported.

## Checks completed
npm.cmd test: 14 passed. Includes blanks vs zero, invalid numbers, percentage bounds, unsupported units, non-detects, date validity, quoted/multiline CSV, malformed quotes, headers, column counts, repeat observations, multi-batch files, metadata conflicts, row limits and the downloadable example.

npm.cmd run typecheck and npm.cmd run build passed. Updated app was opened and its Stage 3 import controls verified in browser. A complete file-picker import journey has not yet been browser-tested.

## Try it
1. Download the synthetic example from the app.
2. Choose that CSV; inspect the two-batch preview and warnings.
3. Click Load validated batches and switch between SYN-101 and SYN-102.
4. Click Preview assessment layout. Change a measurement and verify the stale banner.
5. Change a unit to unsupported text, preview, and verify the error.

Screening, treatment calculations, AI and report export remain later-stage work.
