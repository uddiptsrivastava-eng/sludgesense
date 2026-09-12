import type { ParameterDefinition } from "./types";

/** User-supplied scope, not safety criteria or a regulatory profile. */
export const parameterCatalog = [
  { id: "moisture", category: "Physical", label: "Moisture %", purpose: "Determines handling/dewatering needs" },
  { id: "totalSolids", category: "Physical", label: "Total solids %", purpose: "Determines concentration" },
  { id: "volatileSolids", category: "Physical", label: "Volatile solids %", purpose: "Indicates organic fraction" },
  { id: "quantity", category: "Physical", label: "Quantity", purpose: "Determines economic feasibility" },
  { id: "ph", category: "Chemical", label: "pH", purpose: "Affects suitability/treatment" },
  { id: "organicMatter", category: "Chemical", label: "Organic matter %", purpose: "Indicates resource potential" },
  { id: "toc", category: "Chemical", label: "TOC", purpose: "Organic/resource potential" },
  { id: "nitrogen", category: "Nutrients", label: "Nitrogen", purpose: "Fertilizer potential" },
  { id: "phosphorus", category: "Nutrients", label: "Phosphorus", purpose: "Fertilizer potential" },
  { id: "potassium", category: "Nutrients", label: "Potassium", purpose: "Fertilizer potential" },
  { id: "carbonNitrogenRatio", category: "Nutrients", label: "C:N ratio", purpose: "Composting/biological suitability" },
  { id: "lead", category: "Metals", label: "Lead", purpose: "Safety restriction" },
  { id: "cadmium", category: "Metals", label: "Cadmium", purpose: "Safety restriction" },
  { id: "chromium", category: "Metals", label: "Chromium", purpose: "Safety restriction" },
  { id: "mercury", category: "Metals", label: "Mercury", purpose: "Safety restriction" },
  { id: "arsenic", category: "Metals", label: "Arsenic", purpose: "Safety restriction" },
  { id: "copper", category: "Metals", label: "Copper", purpose: "Safety/resource consideration" },
  { id: "nickel", category: "Metals", label: "Nickel", purpose: "Safety restriction" },
  { id: "zinc", category: "Metals", label: "Zinc", purpose: "Safety/resource consideration" },
  { id: "fecalColiform", category: "Biological", label: "Fecal coliform", purpose: "Pathogen risk" },
  { id: "eColi", category: "Biological", label: "E. coli", purpose: "Pathogen risk" },
  { id: "helminthIndicator", category: "Biological", label: "Helminth indicator", purpose: "Pathogen risk" },
  { id: "otherPathogenIndicator", category: "Biological", label: "Other pathogen indicator", purpose: "Pathogen risk" },
] as const satisfies readonly ParameterDefinition[];
