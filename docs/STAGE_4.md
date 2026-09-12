# Stage 4 — explainable demo screening

## What is implemented
Pure deterministic screenBatch(batch, profile) in src/lib/screening/index.ts. Independent checks for agriculture, composting feedstock, energy recovery and construction incorporation. Profile metadata and criteria are separate in src/lib/screening/profile.ts. The UI passes the validated batch (including all repeated imported observations) to the same function for manual and CSV input.

No trained ML model, AI provider, treatment calculation or regulatory approval is implemented. Profile numbers are invented hackathon assumptions and must never be represented as scientific recommendations or legal limits.

## Profile identity and provenance
sludgesense-illustrative / 1.0.0
Illustrative demo profile — not regulatory guidance
Every criterion stores an ID, parameter, unit, basis, comparison, failure action, rationale and explicit invented-demo provenance. Pathway ownership is defined by the enclosing pathway. Exact analyte and method requirements are also specified when applicable. UI exposes all these fields alongside actual observation evidence.

## Illustrative gates (not real standards)
All four pathways use invented dry-solids total-metal caps (mg/kg): lead 50, cadmium 1, chromium 60, mercury 0.5, arsenic 5, copper 100, nickel 20 and zinc 200. Failing one is a hard exclusion only within this artificial profile.

Agriculture: pH 6–8 (as reported), total nitrogen >=1% and total phosphorus >=0.5% (dry solids), E. coli <=100 CFU/g and viable helminth eggs <=1 eggs/g (dry solids, named method).
Compost: moisture 40–65% wet mass, total-carbon:total-nitrogen mass ratio 20–35, E. coli <=100 CFU/g dry solids with a named method.
Energy: volatile solids >=45% of total solids, total solids >=20% wet mass.
Construction: moisture <=30% wet mass, total solids >=70% wet mass.
These are deliberately simplified hypothetical route specifications. They do not represent all processes in a category. Endpoints are inclusive.

## Result precedence
1. Any proven hard exclusion -> Excluded under demo criteria. Missing evidence is still displayed; an exclusion is not a completed safety assessment.
2. Otherwise any unknown required criterion -> Insufficient data, even if another preparation barrier is already known.
3. Otherwise any failed non-exclusion check -> Treatment or further evaluation needed.
4. Otherwise -> Potential candidate under demo criteria, with all unassessed requirements still visible.

There is no overall score. Resource values cannot offset hard exclusions. Each pathway is calculated independently; being excluded from one never establishes suitability for another.

## Evidence semantics
Missing, invalid, wrong-unit, wrong-basis, wrong-analyte or missing required method results are unknown. Units are exact and never converted. Basis and analyte matching ignore case and excess whitespace only. No substitution among carbon measurements, chromium species or biological indicators.

Measured results are point values. Less-than and greater-than qualifiers are treated as strict bounds. Non-detects are conservatively treated as an interval from zero through the reported detection limit, never a fabricated zero. Intervals entirely within a criterion pass; entirely outside fail; overlapping intervals are unknown. No limit means unknown.

Repeated observations: any failure takes precedence, otherwise any unknown makes that criterion unknown, otherwise all pass. No averaging or favourable-result selection. Parameter rows that the profile does not use are disclosed in assessment limits. Counts are not safety scores.

## Demonstration
SYN-CANDIDATE: candidate under agriculture, compost and energy demo criteria; construction preparation needs evaluation.
SYN-TREATMENT: all four require treatment or further evaluation.
SYN-MISSING: all four have insufficient data.
Change SYN-CANDIDATE total lead from 10 to 500 mg/kg and rerun: all four are excluded under their individual demo caps.
The sample name never determines results. The downloadable screening-batches.csv has the same measurements for CSV demos. Original stage-3 incomplete example remains available.

## Replacing the demo profile
Before real use, select an actual jurisdiction, reuse product/process and facility. Obtain applicable primary standards and expert review. Replace all invented thresholds, units, analyte definitions, method requirements, mandatory tests and aggregation policies; record actual source titles/links, editions, dates and applicability. Expand currently unassessed requirements and add tests against expert-labelled cases. Increment the profile version when rules change. Do not mix a few sourced values into this profile and imply the whole assessment is validated.

## Verification
Automated checks cover threshold endpoints, missing data, hard exclusions, conflicting criteria, repeated observations, incompatible units/analytes/methods, censored results, deterministic behavior, no input mutation and custom profile versions. CSV samples are evaluated by the identical engine.
Browser checks: all three synthetic outcomes, stale result after editing, lead exclusion, comparison evidence and provenance expansion, and mobile width with no horizontal overflow. No browser console errors observed during checks. Full accessibility audit and regulatory validation were not performed.

## Scope retained
Stage 5 treatment selection, sources, simulations and value estimates remain unimplemented. GitHub publication and deployment have not been performed.

Four built-in samples: SYN-CANDIDATE, SYN-TREATMENT, SYN-EXCLUDED (lead 500 mg/kg; all pathways excluded under demo criteria), and SYN-MISSING. The selector and Screening samples CSV use identical data.

