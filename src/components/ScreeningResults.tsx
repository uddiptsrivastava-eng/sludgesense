import type { PathwayResult, ScreeningAssessment } from "@/lib/screening";
import { describeComparison } from "@/lib/screening";
export function statusClass(status:string):string {
  return status.startsWith("Excluded")?"excluded":status.startsWith("Insufficient")?"insufficient":status.startsWith("Treatment")?"evaluation":"candidate";
}
export function ProfileNote({assessment}:{assessment:ScreeningAssessment}) {
  return <div className="evidence profile-note"><strong>{assessment.profileName}</strong><p>Version {assessment.profileVersion} · {assessment.profileId}</p><p>{assessment.profileProvenance}</p><details><summary>Limits of this assessment</summary><ul>{assessment.limitations.map(text=><li key={text}>{text}</li>)}</ul>{assessment.unscreenedParameters.length>0&&<p>Supplied parameters not used by this profile: {assessment.unscreenedParameters.join(", ")}.</p>}</details></div>;
}
export function PathwayCard({pathway}:{pathway:PathwayResult}) {
  return <article className="panel pathway"><span className={`screen-status ${statusClass(pathway.status)}`}>{pathway.status}</span><h2>{pathway.name}</h2><p>{pathway.reason}</p>
    {pathway.barriers.length>0&&<div className="barrier-list"><h3>Known barriers</h3><ul>{pathway.barriers.map(text=><li key={text}>{text}</li>)}</ul></div>}
    {pathway.missingEvidence.length>0&&<details><summary>{pathway.missingEvidence.length} missing or incompatible checks</summary><ul>{pathway.missingEvidence.map(text=><li key={text}>{text}</li>)}</ul></details>}
    <details className="rule-evidence"><summary>Inspect {pathway.criteria.length} criteria and measurements</summary>{pathway.criteria.map(result=><section className="criterion" key={result.criterion.id}>
      <div className="criterion-heading"><strong>{result.criterion.parameter}</strong><span>{result.outcome==="pass"?"Meets demo check":result.outcome==="fail"?"Outside demo criterion":"Unknown"}</span></div>
      <p><strong>Rule:</strong> {describeComparison(result.criterion)}</p>
      <p className="small">ID: {result.criterion.id} · Failing result: {result.criterion.failure==="exclude"?"exclude":"further evaluation"}</p>
      {result.criterion.analyte&&<p className="small">Required analyte: {result.criterion.analyte}{result.criterion.methodRequired?"; named method required":""}</p>}
      <p>{result.reason}</p>
      <ul>{result.evidence.map(e=><li key={e.observation}><strong>Observation {e.observation}:</strong> {e.measurement.qualifier} {e.measurement.value??"unknown"} {e.measurement.unit??"unknown unit"}; {e.measurement.basis??"unknown basis"}. {e.measurement.detectionLimit!==null?`Detection limit: ${e.measurement.detectionLimit}. `:""}{e.reason}<p className="small">Analyte: {e.measurement.analyte??"unknown"} · Method: {e.measurement.method??"unknown"} · Source: {e.measurement.provenance}</p></li>)}</ul>
      <p><strong>Why included:</strong> {result.criterion.rationale}</p><p className="small">Provenance: {result.criterion.provenance}</p>
    </section>)}</details>
    <div className="pathway-footer"><strong>Still unassessed</strong><ul>{pathway.unassessedRequirements.map(text=><li key={text}>{text}</li>)}</ul></div>
  </article>;
}
