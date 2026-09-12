# SludgeSense project specification

## Purpose
Help STP operators explore batch quality, potential reuse pathways, barriers and treatment/testing needs. This hackathon prototype does not certify reuse.

## Completed stages
Stage 1: Next.js App Router, TypeScript, Tailwind, npm lockfile, module boundaries, health endpoint, data contracts and setup documentation.
Stage 2: three working interface views, manual draft entry, synthetic sample selection and demonstration result layout. Later-stage scientific functionality remains unimplemented.

## Stage 2 acceptance criteria
- Batch assessment, reuse comparison and treatment planner navigation works.
- All catalogue parameters have editable fields grouped by category.
- Batch identifier, sampling date and treatment history are editable.
- Three labelled synthetic scenarios can be loaded.
- Preview action requires a batch identifier and clearly reports no actual screening.
- Editing after preview marks that snapshot stale; refreshing an edited sample shows unassessed copy.
- Reset clears values, metadata and preview; tab navigation preserves session state.
- No scientific status, treatment efficacy, price or model accuracy is fabricated.
- CSV import is marked as Stage 3; treatment calculations, AI and export remain future work.
- Layouts support mobile and desktop; inputs have labels and visible focus states.
- Production build and typecheck pass with no API key.

## Architecture
One repository: frontend and server endpoints in src/app; domain contracts in src/lib/types.ts; catalogue in src/lib/parameters.ts. Validation, screening, treatment and AI remain separate module boundaries. src/lib/demo.ts contains explicitly synthetic fixtures and string-valued UI drafts. These drafts are not validated SludgeBatch domain objects. The UI preserves raw strings including unknowns; Stage 3 will add parsing, qualifiers/detection-limit normalization, multiple observations and provenance mapping. Browser memory only; no durable storage.

## Future journey
Validated manual input or CSV -> completeness and pathway screening -> evidence and barriers -> documented treatment considerations and simulations -> report export. AI explanations remain optional and may never override screening outcomes. Missing critical data must return Insufficient data once screening exists. No inference from sample-story identity is permitted.

## Parameter scope
Use docs/DATA_REQUIREMENTS.md and src/lib/parameters.ts. Separate biological indicators are preserved; units, basis, methods, analytes and qualifiers must not be guessed or silently converted.

## Exclusions
Authentication, database, payments, marketplace, IoT, trained ML, OCR and live deployment. Do not implement additional stages until requested.

## Stage 3 completed
See docs/STAGE_3.md for the implemented schema, validation, limits, import behavior and checks. This supersedes earlier references to CSV or validation as unimplemented. No screening has been added.

## Stage 4 completed
Deterministic, versioned illustrative screening is implemented. See docs/STAGE_4.md for criteria, provenance, precedence, evidence semantics, verification and limitations. This supersedes earlier unimplemented-screening notes.
