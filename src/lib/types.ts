/** Stage 1 data contracts only; runtime validation and screening come later. */
export type AssessmentStatus =
  | "Potential candidate under demo criteria"
  | "Treatment or further evaluation needed"
  | "Excluded under demo criteria"
  | "Insufficient data";

export type ParameterCategory = "Physical" | "Chemical" | "Nutrients" | "Metals" | "Biological";
export type ParameterId =
  | "moisture" | "totalSolids" | "volatileSolids" | "quantity"
  | "ph" | "organicMatter" | "toc"
  | "nitrogen" | "phosphorus" | "potassium" | "carbonNitrogenRatio"
  | "lead" | "cadmium" | "chromium" | "mercury" | "arsenic" | "copper" | "nickel" | "zinc"
  | "fecalColiform" | "eColi" | "helminthIndicator" | "otherPathogenIndicator";

/** Preserve the reported result without guessing units, basis or missing values. */
export interface Measurement {
  value: number | null;
  unit: string | null;
  basis: string | null;
  method: string | null;
  /** Exact analyte, species, nutrient form or organism named in the lab report. */
  analyte: string | null;
  qualifier: "measured" | "lessThan" | "greaterThan" | "notDetected" | "notMeasured";
  detectionLimit: number | null;
  provenance: "laboratory" | "userReported" | "synthetic" | "derived";
  notes: string | null;
}

export interface SludgeBatch {
  id: string;
  sampledAt: string | null;
  treatmentHistory: string | null;
  /** Omitted keys mean not supplied. Arrays preserve multiple methods/species. */
  measurements: Partial<Record<ParameterId, Measurement[]>>;
}

export interface ParameterDefinition {
  id: ParameterId;
  category: ParameterCategory;
  label: string;
  purpose: string;
}
