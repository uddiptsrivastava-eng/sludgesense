import { parameterCatalog } from "../parameters";
import type { Measurement, ParameterId, SludgeBatch } from "../types";
export interface RawObservation { parameter: string; value: string; unit: string; basis: string; method: string; analyte: string; qualifier: string; detectionLimit: string; provenance: string; notes: string; row?: number; }
export interface RawBatch { id: string; sampledAt: string; treatmentHistory: string; observations: RawObservation[]; }
export interface Issue { row?: number; field: string; message: string; }
export interface ValidationResult { batch: SludgeBatch; errors: Issue[]; warnings: Issue[]; }
export const MAX_FILE_BYTES = 1024 * 1024;
export const MAX_ROWS = 1000;
const ids = new Set<string>(parameterCatalog.map(p => p.id));
const percentages = new Set(["moisture", "totalSolids", "volatileSolids", "organicMatter"]);
const metals = new Set(parameterCatalog.filter(p => p.category === "Metals").map(p => p.id as string));
const biological = new Set(parameterCatalog.filter(p => p.category === "Biological").map(p => p.id as string));
export function allowedUnits(id: string): string[] {
  if (percentages.has(id)) return ["%"];
  if (id === "ph") return ["pH"];
  if (id === "quantity") return ["kg", "tonne", "L", "m3"];
  if (id === "carbonNitrogenRatio") return ["ratio"];
  if (metals.has(id)) return ["mg/kg", "ug/kg"];
  if (biological.has(id)) return ["CFU/g", "MPN/g", "eggs/g", "ova/g"];
  return ["%", "g/kg", "mg/kg"];
}
const qualifiers = ["measured", "lessThan", "greaterThan", "notDetected", "notMeasured"];
const provenances = ["laboratory", "userReported", "synthetic", "derived"];
export function validateBatch(raw: RawBatch): ValidationResult {
  const errors: Issue[] = [], warnings: Issue[] = [];
  const batch: SludgeBatch = { id: raw.id.trim(), sampledAt: raw.sampledAt.trim() || null, treatmentHistory: raw.treatmentHistory.trim() || null, measurements: {} };
  if (!batch.id) errors.push({field:"batch_id", message:"Batch identifier is required."});
  if (batch.id.length > 120) errors.push({field:"batch_id", message:"Batch identifier must be at most 120 characters."});
  if (batch.sampledAt && (!/^\d{4}-\d{2}-\d{2}$/.test(batch.sampledAt) || !Number.isFinite(Date.parse(batch.sampledAt)) || new Date(batch.sampledAt).toISOString().slice(0,10) !== batch.sampledAt)) errors.push({field:"sampled_at",message:"Use a real date in YYYY-MM-DD format."});
  raw.observations.forEach(o => {
    const add = (target: Issue[], field: string, message: string) => target.push({row:o.row,field:`${o.parameter}: ${field}`,message});
    if (!ids.has(o.parameter)) { add(errors,"parameter","Unknown parameter identifier."); return; }
    const number = (text: string, field: string): number | null => {
      if (!text.trim()) return null;
      if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text.trim()) || !Number.isFinite(Number(text))) { add(errors,field,"Enter a finite decimal number; leave unknown values blank."); return null; }
      const n = Number(text); if (n < 0) add(errors,field,"Negative values are not supported by this input schema.");
      return n;
    };
    const value = number(o.value,"value"), limit = number(o.detectionLimit,"detection_limit");
    if (percentages.has(o.parameter) && value !== null && value > 100) add(errors,"value","A percentage must be between 0 and 100.");
    const qualifier = o.qualifier.trim() || (value === null ? "notMeasured" : "measured");
    if (!qualifiers.includes(qualifier)) add(errors,"qualifier",`Use ${qualifiers.join(", ")}.`);
    if (!provenances.includes(o.provenance)) add(errors,"provenance",`Use ${provenances.join(", ")}.`);
    if (["lessThan","greaterThan"].includes(qualifier) && value === null) add(errors,"value","A comparison qualifier requires a reported bound.");
    if (["notDetected","notMeasured"].includes(qualifier) && value !== null) add(errors,"value","Leave value blank for not-detected or not-measured results; put any detection limit in its own field.");
    if (o.unit.trim() && !allowedUnits(o.parameter).includes(o.unit.trim())) add(errors,"unit",`Unsupported unit. Accepted: ${allowedUnits(o.parameter).join(", ")}. No conversion is performed.`);
    if (value !== null || qualifier === "notDetected" || limit !== null) {
      if (!o.unit.trim()) add(warnings,"unit","Unit is unknown; result is not ready for comparison.");
      if (!o.basis.trim()) add(warnings,"basis","Measurement basis is unknown.");
      if (biological.has(o.parameter) && (!o.method.trim() || !o.analyte.trim())) add(warnings,"method/analyte","Biological results need the named organism and test method.");
    }
    if (qualifier === "notDetected" && limit === null) add(warnings,"detection_limit","Detection limit is unknown; not detected does not mean zero.");
    if (value === null && qualifier === "measured") add(warnings,"value","No numeric result supplied; value remains unknown.");
    const m: Measurement = {value,unit:o.unit.trim() || null,basis:o.basis.trim() || null,method:o.method.trim() || null,analyte:o.analyte.trim() || null,qualifier:qualifier as Measurement["qualifier"],detectionLimit:limit,provenance:o.provenance as Measurement["provenance"],notes:o.notes.trim() || null};
    (batch.measurements[o.parameter as ParameterId] ??= []).push(m);
  });
  if (!Object.values(batch.measurements).some(ms=>ms.some(m=>m.value!==null || m.qualifier==="notDetected"))) warnings.push({field:"measurements",message:"No measured evidence supplied. Insufficient data for reuse decisions."});
  return {batch,errors,warnings};
}
