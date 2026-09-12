import type { ParameterId } from "../types";
export type PathwayId = "agriculture" | "compost" | "energy" | "construction";
export type Comparison = { operator:"max"; value:number } | { operator:"min"; value:number } | { operator:"range"; min:number; max:number };
export interface Criterion {
  id:string; parameter:ParameterId; unit:string; basis:string; analyte?:string; methodRequired?:boolean;
  comparison:Comparison; failure:"exclude"|"evaluate"; rationale:string; provenance:string;
}
export interface PathwayProfile { id:PathwayId; name:string; criteria:Criterion[]; unassessedRequirements:string[]; }
export interface ScreeningProfile { id:string; version:string; name:string; provenance:string; limitations:string[]; pathways:PathwayProfile[]; }
const provenance="Invented hackathon demonstration assumption; not derived from a law, standard or validated process study.";
const metalValues = {lead:50,cadmium:1,chromium:60,mercury:0.5,arsenic:5,copper:100,nickel:20,zinc:200} as const;
const metalCriteria = ():Criterion[] => Object.entries(metalValues).map(([parameter,value])=>({id:`${parameter}-demo-cap`,parameter:parameter as ParameterId,unit:"mg/kg",basis:"dry solids",analyte:`total ${parameter}`,comparison:{operator:"max",value},failure:"exclude",rationale:"Demonstrates a hard exclusion that cannot be offset by nutrient or resource potential. This number has no regulatory standing.",provenance}));
function rule(id:string,parameter:ParameterId,unit:string,basis:string,comparison:Comparison,rationale:string,extra:Partial<Criterion>={}):Criterion {
  return {id,parameter,unit,basis,comparison,failure:"evaluate",rationale,provenance,...extra};
}
const commonLimits=["Jurisdiction-specific permissions and expert-reviewed limits have not been assessed.","No analytical-method certification, sample representativeness or treatment verification is established.","Contaminants outside this small demo profile are not assessed; a candidate result is not clearance."];
export const demoProfile:ScreeningProfile={
  id:"sludgesense-illustrative",version:"1.0.0",name:"Illustrative demo profile — not regulatory guidance",provenance,
  limitations:commonLimits,
  pathways:[
    {id:"agriculture",name:"Agricultural soil amendment",criteria:[...metalCriteria(),
      rule("ph-demo-range","ph","pH","as reported",{operator:"range",min:6,max:8},"Demonstrates a pathway-specific chemistry barrier."),
      rule("nitrogen-demo-min","nitrogen","%","dry solids",{operator:"min",value:1},"Demonstrates a resource consideration, not a fertilizer specification.",{analyte:"total nitrogen"}),
      rule("phosphorus-demo-min","phosphorus","%","dry solids",{operator:"min",value:0.5},"Demonstrates an additional nutrient gate.",{analyte:"total phosphorus"}),
      rule("ecoli-demo-cap","eColi","CFU/g","dry solids",{operator:"max",value:100},"Demonstrates unresolved biological evidence; no sanitation claim is made.",{analyte:"E. coli",methodRequired:true}),
      rule("helminth-demo-cap","helminthIndicator","eggs/g","dry solids",{operator:"max",value:1},"Demonstrates an independent biological gate.",{analyte:"viable helminth eggs",methodRequired:true})],unassessedRequirements:["Site-specific soil, crop, application-rate and exposure assessment.","Other pathogens, organic contaminants and local land-application requirements."]},
    {id:"compost",name:"Composting feedstock",criteria:[...metalCriteria(),
      rule("moisture-compost-window","moisture","%","wet mass",{operator:"range",min:40,max:65},"Demonstrates a process-input window; it is not a compost recipe."),
      rule("cn-demo-window","carbonNitrogenRatio","ratio","mass C:N",{operator:"range",min:20,max:35},"Demonstrates a ratio requirement with an explicit convention.",{analyte:"total carbon:total nitrogen"}),
      rule("ecoli-compost-cap","eColi","CFU/g","dry solids",{operator:"max",value:100},"Demonstrates the need to evaluate biological barriers separately.",{analyte:"E. coli",methodRequired:true})],unassessedRequirements:["Validated process controls, co-feedstocks and pathogen reduction.","Finished-product quality and local product approvals."]},
    {id:"energy",name:"Energy recovery",criteria:[...metalCriteria(),
      rule("vs-demo-min","volatileSolids","%","total solids",{operator:"min",value:45},"Demonstrates a resource gate; it does not predict energy output."),
      rule("solids-energy-min","totalSolids","%","wet mass",{operator:"min",value:20},"Demonstrates a feed specification for a hypothetical route, not all energy processes.")],unassessedRequirements:["Selection of the actual energy process, calorific or biodegradability tests and pilot testing.","Emissions, operating permits, residue handling and facility acceptance."]},
    {id:"construction",name:"Construction-material incorporation",criteria:[...metalCriteria(),
      rule("moisture-construction-cap","moisture","%","wet mass",{operator:"max",value:30},"Demonstrates a preparation barrier for a hypothetical product."),
      rule("solids-construction-min","totalSolids","%","wet mass",{operator:"min",value:70},"Demonstrates a preparation specification; no product performance is inferred.")],unassessedRequirements:["Leachability, product strength, durability and contaminant release testing.","Manufacturing controls, worker exposure and local product approval."]},
  ],
};

