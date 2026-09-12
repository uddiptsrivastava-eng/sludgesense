import type { ParameterId } from "./types";
export interface DraftReading {value:string;unit:string;basis:string;method:string;analyte:string;qualifier:string;notes:string;detectionLimit:string;provenance:string;}
export type DraftReadings=Partial<Record<ParameterId,DraftReading>>;
export const emptyReading:DraftReading={value:"",unit:"",basis:"",method:"",analyte:"",qualifier:"measured",notes:"",detectionLimit:"",provenance:"userReported"};
export const demoScenarios=[
  {id:"candidate",title:"Candidate pathways",batchId:"SYN-CANDIDATE",sampledAt:"2026-09-01",treatmentHistory:"Synthetic scenario; no real treatment or laboratory test",summary:"Synthetic measurements meet several demo pathways, with a construction-preparation barrier."},
  {id:"barriers",title:"Treatment barriers",batchId:"SYN-TREATMENT",sampledAt:"2026-09-01",treatmentHistory:"Synthetic scenario; no real treatment or laboratory test",summary:"Synthetic values demonstrate preparation, chemistry and biological barriers without a hard metal exclusion."},
  {id:"excluded",title:"Metal exclusion",batchId:"SYN-EXCLUDED",sampledAt:"2026-09-01",treatmentHistory:"Synthetic scenario; no real treatment or laboratory test",summary:"Synthetic lead concentration exceeds the illustrative cap in all four pathways."},
  {id:"missing",title:"Missing critical data",batchId:"SYN-MISSING",sampledAt:"2026-09-01",treatmentHistory:"Synthetic scenario; no real treatment or laboratory test",summary:"Synthetic incomplete evidence demonstrates Insufficient data."},
] as const;
export type DemoId=typeof demoScenarios[number]["id"];
function reading(value:string,unit:string,basis:string,analyte="",method=""):DraftReading {
  return {...emptyReading,value,unit,basis,analyte,method,provenance:"synthetic",notes:"Invented hackathon sample. No real lab analysis or treatment is represented."};
}
export function getDemoReadings(id:DemoId):DraftReadings {
  if(id==="missing")return {quantity:reading("5","tonne","wet mass"),moisture:reading("80","%","wet mass")};
  const r:DraftReadings={
    moisture:reading("55","%","wet mass"),totalSolids:reading("45","%","wet mass"),volatileSolids:reading("60","%","total solids"),quantity:reading("10","tonne","wet mass"),
    ph:reading("7","pH","as reported"),nitrogen:reading("2","%","dry solids","total nitrogen"),phosphorus:reading("1","%","dry solids","total phosphorus"),
    carbonNitrogenRatio:reading("25","ratio","mass C:N","total carbon:total nitrogen"),
    eColi:reading("10","CFU/g","dry solids","E. coli","Synthetic method label; not validated"),helminthIndicator:reading("0","eggs/g","dry solids","viable helminth eggs","Synthetic method label; not validated"),
  };
  for(const [id,value] of Object.entries({lead:"10",cadmium:"0.1",chromium:"10",mercury:"0.1",arsenic:"1",copper:"20",nickel:"5",zinc:"40"}))r[id as ParameterId]=reading(value,"mg/kg","dry solids",`total ${id}`);
  if(id==="barriers"){
    r.moisture=reading("85","%","wet mass");r.totalSolids=reading("15","%","wet mass");r.ph=reading("10","pH","as reported");r.eColi=reading("500","CFU/g","dry solids","E. coli","Synthetic method label; not validated");
  }
  if(id==="excluded")r.lead=reading("500","mg/kg","dry solids","total lead");
  return r;
}

