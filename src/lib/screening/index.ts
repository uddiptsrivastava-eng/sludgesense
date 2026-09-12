import type { AssessmentStatus, Measurement, SludgeBatch } from "../types";
import { demoProfile, type Criterion, type ScreeningProfile, type PathwayId } from "./profile";
export type RuleOutcome="pass"|"fail"|"unknown";
export interface ObservationEvidence { observation:number; measurement:Measurement; outcome:RuleOutcome; reason:string; }
export interface CriterionResult { criterion:Criterion; outcome:RuleOutcome; reason:string; evidence:ObservationEvidence[]; }
export interface PathwayResult { id:PathwayId; name:string; status:AssessmentStatus; reason:string; criteria:CriterionResult[]; missingEvidence:string[]; barriers:string[]; unassessedRequirements:string[]; }
export interface ScreeningAssessment { batchId:string; profileId:string; profileVersion:string; profileName:string; profileProvenance:string; limitations:string[]; pathways:PathwayResult[]; unscreenedParameters:string[]; }
const normalized=(s:string|null|undefined)=>(s??"").trim().toLowerCase().replace(/\s+/g," ");
export function compareObservation(m:Measurement,c:Criterion):{outcome:RuleOutcome;reason:string} {
  const unknown=(reason:string)=>({outcome:"unknown" as const,reason});
  if(m.unit!==c.unit)return unknown(`Expected unit ${c.unit}; received ${m.unit||"unknown"}. No conversion applied.`);
  if(normalized(m.basis)!==normalized(c.basis))return unknown(`Expected basis ${c.basis}; received ${m.basis||"unknown"}.`);
  if(c.analyte&&normalized(m.analyte)!==normalized(c.analyte))return unknown(`Expected analyte ${c.analyte}; received ${m.analyte||"unknown"}.`);
  if(c.methodRequired&&!m.method?.trim())return unknown("A named test method is required by this demo criterion.");
  let low:number,high:number,lowOpen=false,highOpen=false;
  if(m.qualifier==="notMeasured")return unknown("Measurement was not supplied.");
  if(m.qualifier==="notDetected"){
    if(m.value!==null)return unknown("Non-detect with a numeric value is contradictory; use a separate detection limit.");
    if(m.detectionLimit===null||!Number.isFinite(m.detectionLimit)||m.detectionLimit<0)return unknown("Non-detect has no usable detection limit; it cannot be treated as zero.");
    low=0;high=m.detectionLimit;
  }else{
    if(m.value===null||!Number.isFinite(m.value)||m.value<0)return unknown("A finite, nonnegative result or bound is missing.");
    if(m.qualifier==="measured"){low=m.value;high=m.value;}
    else if(m.qualifier==="lessThan"){if(m.value===0)return unknown("A negative-only bound is outside this schema.");low=0;high=m.value;highOpen=true;}
    else if(m.qualifier==="greaterThan"){low=m.value;high=Infinity;lowOpen=true;}
    else return unknown("Unrecognized result qualifier.");
  }
  const bound=c.comparison;
  const min=bound.operator==="max"?-Infinity:bound.operator==="min"?bound.value:bound.min;
  const max=bound.operator==="min"?Infinity:bound.operator==="max"?bound.value:bound.max;
  if(low>=min&&high<=max)return {outcome:"pass",reason:"Reported value or entire reported interval meets this illustrative criterion."};
  if(high<min||(high===min&&highOpen)||low>max||(low===max&&lowOpen))return {outcome:"fail",reason:"Reported value or entire reported interval is outside this illustrative criterion."};
  return unknown("The reported bound overlaps the demo threshold; a more precise result is needed.");
}
export function describeComparison(c:Criterion):string {
  const rule=c.comparison;
  return `${rule.operator==="range"?`${rule.min} to ${rule.max} (inclusive)`:rule.operator==="max"?`≤ ${rule.value}`:`≥ ${rule.value}`} ${c.unit}; ${c.basis}`;
}
export function screenBatch(batch:SludgeBatch,profile:ScreeningProfile=demoProfile):ScreeningAssessment {
  if(!profile.version||!profile.pathways.length||new Set(profile.pathways.map(p=>p.id)).size!==profile.pathways.length)throw new Error("Invalid screening profile identity or pathways.");
  const used=new Set<string>();
  const pathways=profile.pathways.map(pathway=>{
    if(!pathway.criteria.length||new Set(pathway.criteria.map(c=>c.id)).size!==pathway.criteria.length)throw new Error("Each pathway needs unique, nonempty criteria.");
    const criteria=pathway.criteria.map(criterion=>{
      const comparison=criterion.comparison;
      if(comparison.operator==="range"?(!Number.isFinite(comparison.min)||!Number.isFinite(comparison.max)||comparison.min>comparison.max):!Number.isFinite(comparison.value))throw new Error("Invalid numeric criterion.");
      used.add(criterion.parameter);
      const evidence=(batch.measurements[criterion.parameter]??[]).map((measurement,index)=>({observation:index+1,measurement,...compareObservation(measurement,criterion)}));
      const outcome:RuleOutcome=evidence.some(e=>e.outcome==="fail")?"fail":!evidence.length||evidence.some(e=>e.outcome==="unknown")?"unknown":"pass";
      return {criterion,outcome,evidence,reason:!evidence.length?"No observation supplied.":outcome==="fail"?"At least one observation fails; passing repeats do not erase it.":outcome==="unknown"?"At least one observation lacks comparable evidence.":"All supplied observations meet this demo criterion."};
    });
    const excluded=criteria.some(r=>r.outcome==="fail"&&r.criterion.failure==="exclude");
    const missing=criteria.filter(r=>r.outcome==="unknown");
    const barriers=criteria.filter(r=>r.outcome==="fail");
    const status:AssessmentStatus=excluded?"Excluded under demo criteria":missing.length?"Insufficient data":barriers.length?"Treatment or further evaluation needed":"Potential candidate under demo criteria";
    const reason=excluded?"A hard demo exclusion was triggered. Other gaps are still listed; resource potential cannot override it.":missing.length?"Critical demo evidence is missing or not comparable. Any known barriers remain visible.":barriers.length?"All demo checks have usable evidence, but one or more preparation or resource criteria are not met.":"All checks in this limited illustrative profile are met. Unassessed requirements still prevent a real-world approval.";
    return {id:pathway.id,name:pathway.name,status,reason,criteria,missingEvidence:missing.map(r=>`${r.criterion.parameter}: ${r.reason}`),barriers:barriers.map(r=>`${r.criterion.parameter}: ${describeComparison(r.criterion)} — ${r.criterion.failure==="exclude"?"hard demo exclusion":"further evaluation"}`),unassessedRequirements:[...pathway.unassessedRequirements]};
  });
  return {batchId:batch.id,profileId:profile.id,profileVersion:profile.version,profileName:profile.name,profileProvenance:profile.provenance,limitations:[...profile.limitations],pathways,unscreenedParameters:Object.keys(batch.measurements).filter(p=>!used.has(p)).sort()};
}
