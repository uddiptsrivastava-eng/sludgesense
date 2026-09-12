# Batch parameter requirements

Source: user-provided parameter table. These are product input requirements, not verified regulatory criteria or a complete laboratory testing standard. No screening thresholds are introduced here.

| Category | Parameters |
| --- | --- |
| Physical | Moisture %, total solids %, volatile solids %, quantity |
| Chemical | pH, organic matter %, total organic carbon (TOC) |
| Nutrients | Nitrogen, phosphorus, potassium, C:N ratio |
| Metals | Lead, cadmium, chromium, mercury, arsenic, copper, nickel, zinc |
| Biological | Fecal coliform, E. coli, helminth indicator, other named pathogen indicator |

The two grouped biological rows are expanded into separate identifiers so distinct test results can be retained. Supporting both fecal coliform and E. coli fields does not mean both are required for every pathway. Required tests must be specified by the later screening profile.

## Required context for future input forms and CSV
- Preserve the laboratory's reported unit and measurement basis for every result. Unknown unit or basis stays unknown; do not guess.
- Percent measurements require their denominator/basis. In particular, retain the reported basis for volatile solids, organic matter, moisture and total solids.
- Quantity requires a mass or volume unit and the stated wet/dry basis. Volume-to-mass conversion requires explicit supporting information.
- Nutrients and metals retain the reported chemical form/analyte. Do not silently equate differently reported forms, including different chromium species.
- Biological results require a named organism/indicator, method, unit and basis. Retain multiple test results rather than overwriting one with another.
- C:N ratio requires the report's ratio convention or the documented inputs used to derive it.
- Keep organic matter, volatile solids and TOC as separate inputs. No automatic substitution or conversion is implemented.
- Do not automatically derive total solids from moisture, or C:N from unrelated carbon/nitrogen measurements. Any later derivation needs compatible inputs, explicit assumptions and derived provenance.
- Store sample date and treatment history, and distinguish laboratory, user-reported, synthetic and derived values.
- Preserve less-than, greater-than and not-detected qualifiers. A not-detected result is not automatically zero. Store a detection limit when supplied; preserve its context in notes.
- Blank measurements and omitted parameters remain unknown. Missing critical inputs must return Insufficient data once screening is implemented.

## Implementation boundary
`src/lib/parameters.ts` is the shared parameter catalogue for future forms and imports. `src/lib/types.ts` defines data contracts, including multiple observations per parameter. Stage 2 supplies draft input UI only. Runtime validation, CSV column definitions, unit conversion, calculations and critical-field rules are later-stage work. A TypeScript contract does not validate an uploaded file.


## Stage 3 implementation update
Shared runtime validation and browser CSV import are now implemented; see docs/STAGE_3.md for supported units and limits. Unknown context is warned about, not guessed. This supersedes the earlier implementation-boundary note. Critical screening requirements and conversions remain unimplemented.
