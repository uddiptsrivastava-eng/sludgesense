"use client";

import { useState, useTransition } from "react";
import { screenBatch, type ScreeningAssessment } from '@/lib/screening';
import { PathwayCard, ProfileNote, statusClass } from '@/components/ScreeningResults';
import CSVImport from '@/components/CSVImport';
import { validateBatch, allowedUnits, type Issue, type RawObservation } from '@/lib/validation';
import type { SludgeBatch, Measurement } from '@/lib/types';
import { parameterCatalog } from "@/lib/parameters";
import type { ParameterId, ParameterCategory } from "@/lib/types";
import { demoScenarios, emptyReading, getDemoReadings, type DraftReadings, type DraftReading, type DemoId } from "@/lib/demo";

type View = "Batch assessment" | "Reuse comparison" | "Treatment planner";
const views: View[] = ["Batch assessment", "Reuse comparison", "Treatment planner"];
const categories: ParameterCategory[] = ["Physical", "Chemical", "Nutrients", "Metals", "Biological"];


export default function Home() {
  const [view, setView] = useState<View>("Batch assessment");
  const [category, setCategory] = useState<ParameterCategory>("Physical");
  const [batchId, setBatchId] = useState("");
  const [date, setDate] = useState("");
  const [history, setHistory] = useState("");
  const [readings, setReadings] = useState<DraftReadings>({});
  const [sampleId, setSampleId] = useState<DemoId | "">("");
  const [edited, setEdited] = useState(false);
  const [revision, setRevision] = useState(0);
  const [preview, setPreview] = useState<{ revision: number; batchId: string; count: number; sample: DemoId | ""; edited: boolean; assessment: ScreeningAssessment } | null>(null);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [warnings, setWarnings] = useState<Issue[]>([]);
  const [imported, setImported] = useState<SludgeBatch[]>([]);
  const [importedId, setImportedId] = useState("");
  const [additional, setAdditional] = useState<RawObservation[]>([]);
  function applyImported(batch: SludgeBatch) {
    const first: DraftReadings = {}, extra: RawObservation[] = [];
    Object.entries(batch.measurements).forEach(([parameter, measurements]) => measurements.forEach((m: Measurement, index: number) => {
      const draft = { value:m.value===null?"":String(m.value),unit:m.unit??"",basis:m.basis??"",method:m.method??"",analyte:m.analyte??"",qualifier:m.qualifier,detectionLimit:m.detectionLimit===null?"":String(m.detectionLimit),provenance:m.provenance,notes:m.notes??"" };
      if(index===0)first[parameter as ParameterId]=draft;else extra.push({parameter,...draft});
    }));
    setReadings(first);setAdditional(extra);setBatchId(batch.id);setDate(batch.sampledAt??"");setHistory(batch.treatmentHistory??"");setSampleId("");setImportedId(batch.id);setEdited(true);setPreview(null);setIssues([]);setWarnings([]);setError("");setRevision(v=>v+1);
  }
  const [pending, startTransition] = useTransition();
  const count = Object.values(readings).filter((reading) => reading.value.trim() !== "").length;
  const stale = preview !== null && preview.revision !== revision;

  function changed() { setRevision((value) => value + 1); setEdited(true); setError(""); setIssues([]); }
  function updateReading(id: ParameterId, key: keyof DraftReading, value: string) {
    setReadings((current) => ({ ...current, [id]: { ...emptyReading, ...current[id], [key]: value, provenance: sampleId ? "synthetic" : (key === "provenance" ? value : "userReported") } })); changed();
  }
  function loadSample(id: string) {
    setAdditional([]); setImportedId(""); setIssues([]); setWarnings([]); setSampleId(id as DemoId | ""); setReadings(id ? getDemoReadings(id as DemoId) : {});
    setBatchId(demoScenarios.find((item) => item.id === id)?.batchId ?? "");
    setDate(demoScenarios.find(item=>item.id===id)?.sampledAt??""); setHistory(demoScenarios.find(item=>item.id===id)?.treatmentHistory??""); setEdited(false); setPreview(null); setError(""); setRevision((value) => value + 1);
  }
  function showPreview() {
    if (!batchId.trim()) { setError("Enter a batch identifier or choose a synthetic sample."); document.getElementById("batch-id")?.focus(); return; }
    const observations: RawObservation[] = Object.entries(readings).filter(([,r])=>r.value!==""||r.unit!==""||r.basis!==""||r.method!==""||r.analyte!==""||r.notes!==""||r.detectionLimit!==""||r.qualifier!=="measured").map(([parameter,r])=>({parameter,...r}));
    const checked=validateBatch({id:batchId,sampledAt:date,treatmentHistory:history,observations:[...observations,...additional]});
    setIssues(checked.errors); setWarnings(checked.warnings);
    if(checked.errors.length){setError("Fix the input errors below before screening.");return;}
    startTransition(() => { setPreview({ revision, batchId: checked.batch.id, count, sample: sampleId, edited, assessment: screenBatch(checked.batch) }); setError(""); });
  }
  const result = <section className="panel result-panel" aria-labelledby="preview-title" aria-busy={pending}>
    <div className="panel-heading"><h2 id="preview-title">Screening results</h2><span className="pill amber">Illustrative rules</span></div>
    {!preview ? <div className="empty"><span className="empty-symbol" aria-hidden="true">◎</span><h3>Assess the evidence</h3><p>Enter a batch or select a synthetic sample, then run demo screening.</p><p className="small">No trained model or regulatory certification.</p></div> : <div className="preview-body">
      {stale&&<p className="warning" role="status">Inputs changed. These results are out of date. Run screening again.</p>}
      <p className="eyebrow">{preview.batchId}</p><h3>Four pathways, separate checks</h3><p className="small">Results use the measurements, not the sample name. No overall safety score is calculated.</p>
      <div className="screening-summary" aria-live="polite">{preview.assessment.pathways.map(p=><div key={p.id}><strong>{p.name}</strong><span className={`screen-status ${statusClass(p.status)}`}>{p.status}</span></div>)}</div>
      {warnings.length>0&&<details><summary>{warnings.length} input-context warnings</summary><ul>{warnings.map((w,i)=><li key={i}>{w.field}: {w.message}</li>)}</ul></details>}
      <ProfileNote assessment={preview.assessment}/><button className="secondary full" type="button" onClick={()=>setView("Reuse comparison")}>Inspect evidence and barriers <span aria-hidden="true">→</span></button>
    </div>}<div className="panel-foot">Session only. Refreshing clears your draft.</div>
  </section>;
  return <div className="app-shell">
    <a className="skip" href="#main">Skip to workspace</a>
    <aside className="sidebar"><a className="brand" href="/" aria-label="sludge2worth home"><span className="mark" aria-hidden="true">S</span>sludge2worth</a><p className="sidebar-label">REUSE WORKSPACE</p><nav aria-label="Workspace views">{views.map((item, index) => <button key={item} type="button" aria-pressed={view === item} className={view === item ? "nav-item selected" : "nav-item"} onClick={() => setView(item)}><span className="nav-number" aria-hidden="true">0{index + 1}</span>{item}</button>)}</nav><div className="sidebar-bottom"><span className="pill">Stage 4</span><p>Explainable screening<br/>No API key required</p></div></aside>
    <div className="main-shell"><header className="topbar"><span>Sludge quality / Workspace</span><span className="pill">Local demo</span></header>
    <main id="main"><div className="page-title"><div><p className="eyebrow">FROM BATCH DATA TO POSSIBILITIES</p><h1>{view}</h1><p>{view === "Batch assessment" ? "Capture the measurements. Keep the evidence in view." : view === "Reuse comparison" ? "A place to compare pathways and understand the evidence each needs." : "A place to connect reuse barriers with the next steps to investigate."}</p></div></div>
    <div className="demo-banner"><strong>Illustrative demo profile</strong><span>Rules are demonstration assumptions, not regulatory limits. Results do not certify reuse.</span></div>
    {view === "Batch assessment" ? <div className="workspace-grid"><section className="panel input-panel" aria-labelledby="input-title"><div className="panel-heading"><div><h2 id="input-title">Batch details</h2><p className="small">Unknown measurements can stay blank.</p></div><button type="button" className="text-button" onClick={() => loadSample("")}>Clear draft</button></div>
      <div className="input-body"><label className="field" htmlFor="sample">Synthetic sample<select id="sample" value={sampleId} onChange={(event) => loadSample(event.target.value)}><option value="">Manual entry</option>{demoScenarios.map((item) => <option key={item.id} value={item.id}>{item.batchId} · {item.title}</option>)}</select><span className="small">Choosing a sample replaces the current draft. {sampleId ? (edited ? "Synthetic sample edited; run screening again." : "All sample values are synthetic.") : ""}</span></label><div className="quick-screen"><button className="primary full" type="button" disabled={pending} onClick={showPreview}>{pending?"Screening…":"Run demo screening"}</button><p className="small">Use the sample selector above for a prepared synthetic batch.</p></div><CSVImport onImport={batches=>{setImported(batches);applyImported(batches[0]);}}/>{imported.length>0&&<label className="field" htmlFor="imported-batch">Imported batch<select id="imported-batch" value={importedId} onChange={e=>{const selected=imported.find(b=>b.id===e.target.value);if(selected)applyImported(selected);}}><option value="" disabled>Select imported batch</option>{imported.map(b=><option key={b.id} value={b.id}>{b.id}</option>)}</select><span className="small">Switching reloads the original imported batch and replaces draft edits.</span></label>}
      <div className="two-cols"><label className="field" htmlFor="batch-id">Batch identifier<input id="batch-id" value={batchId} onChange={(event) => { setBatchId(event.target.value); changed(); }} placeholder="e.g. STP-2026-001" aria-invalid={!!error} aria-describedby={error ? "input-error" : undefined}/></label><label className="field" htmlFor="sample-date">Sampling date<input type="date" id="sample-date" value={date} onChange={(event) => { setDate(event.target.value); changed(); }}/></label></div>
      <label className="field" htmlFor="history">Treatment history <span className="optional">Optional</span><textarea id="history" value={history} rows={2} onChange={(event) => { setHistory(event.target.value); changed(); }} placeholder="Record the treatment history, if known."/></label>
      <div className="measurement-heading"><h3>Measurements</h3><span className="small">{count} fields entered</span></div>
      <div className="category-buttons" aria-label="Measurement category">{categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)} className={category === item ? "category active" : "category"}>{item}</button>)}</div>
      <div className="measurements">{parameterCatalog.filter((item) => item.category === category).map((item) => {
        const reading = readings[item.id] ?? emptyReading;
        return <fieldset className="reading" key={item.id}><legend>{item.label}</legend><p className="small purpose">{item.purpose}</p><div className="two-cols"><label className="field" htmlFor={`${item.id}-value`}>Reported value<input id={`${item.id}-value`} type="text" inputMode="decimal" value={reading.value} placeholder="Unknown" onChange={(event) => updateReading(item.id, "value", event.target.value)}/></label><label className="field" htmlFor={`${item.id}-unit`}>Reported unit<input id={`${item.id}-unit`} value={reading.unit} placeholder={allowedUnits(item.id).join(" / ")} onChange={(event) => updateReading(item.id, "unit", event.target.value)}/></label></div>
        <label className="field" htmlFor={`${item.id}-basis`}>Measurement basis<input id={`${item.id}-basis`} value={reading.basis} placeholder="e.g. dry solids, wet mass; leave unknown blank" onChange={(event) => updateReading(item.id, "basis", event.target.value)}/></label>
        <details><summary>Method, analyte and result notes</summary><div className="detail-fields"><label className="field" htmlFor={`${item.id}-method`}>Test method<input id={`${item.id}-method`} value={reading.method} onChange={(event) => updateReading(item.id, "method", event.target.value)}/></label><label className="field" htmlFor={`${item.id}-analyte`}>Exact analyte / organism<input id={`${item.id}-analyte`} value={reading.analyte} onChange={(event) => updateReading(item.id, "analyte", event.target.value)}/></label><label className="field" htmlFor={`${item.id}-qualifier`}>Result qualifier<select id={`${item.id}-qualifier`} value={reading.qualifier} onChange={(event) => updateReading(item.id, "qualifier", event.target.value)}><option value="measured">Measured</option><option value="lessThan">Less than reported value</option><option value="greaterThan">Greater than reported value</option><option value="notDetected">Not detected — leave value blank</option><option value="notMeasured">Not measured</option></select></label><label className="field" htmlFor={`${item.id}-limit`}>Detection limit<input id={`${item.id}-limit`} inputMode="decimal" value={reading.detectionLimit} onChange={event=>updateReading(item.id,"detectionLimit",event.target.value)}/></label><label className="field" htmlFor={`${item.id}-provenance`}>Data source<select id={`${item.id}-provenance`} value={reading.provenance} onChange={event=>updateReading(item.id,"provenance",event.target.value)}><option value="userReported">User reported</option><option value="laboratory">Laboratory</option><option value="synthetic">Synthetic</option><option value="derived">Derived</option></select></label><label className="field" htmlFor={`${item.id}-notes`}>Notes<textarea id={`${item.id}-notes`} rows={2} value={reading.notes} onChange={(event) => updateReading(item.id, "notes", event.target.value)}/></label></div></details></fieldset>;
      })}</div>
            {additional.length>0&&<details className="evidence"><summary>{additional.length} additional imported observations retained</summary><p className="small">The form edits the first observation per parameter. These additional observations are preserved and validated. Edit the CSV and reimport to change them.</p><ul>{additional.map((o,i)=><li key={i}>{o.parameter}: {o.value||"Unknown"} {o.unit} · {o.basis||"Unknown basis"} · {o.method||"Unknown method"} · {o.analyte||"Unknown analyte"} · {o.qualifier}</li>)}</ul></details>}
      {issues.length>0&&<ul className="error" role="alert">{issues.map((issue,i)=><li key={i}>{issue.field}: {issue.message}</li>)}</ul>}
      {error && <p className="error" role="alert" id="input-error">{error}</p>}
      <button className="primary full" type="button" disabled={pending} onClick={showPreview}>{pending ? "Screening…" : "Run demo screening"}<span aria-hidden="true">→</span></button><p className="small action-note">Version 1.0.0 · Rule-based demonstration, not regulatory guidance.</p>
      </div></section>{result}</div> : view === "Reuse comparison" ? <><div className="comparison-head"><h2>Pathway assessment</h2><button type="button" className="secondary" onClick={()=>setView("Batch assessment")}>Back to batch</button></div>{preview ? <>{stale&&<p className="warning" role="status">Inputs changed. This assessment is out of date; return to Batch assessment and run screening again.</p>}<p>Batch <strong>{preview.batchId}</strong> · profile v{preview.assessment.profileVersion}</p><ProfileNote assessment={preview.assessment}/><div className="pathway-grid">{preview.assessment.pathways.map(p=><PathwayCard key={p.id} pathway={p}/>)}</div><div className="comparison-bottom"><p>Each pathway is evaluated independently. Passing demo criteria does not approve real reuse.</p><button className="primary" type="button" onClick={()=>setView("Treatment planner")}>View planning stage</button></div></> : <section className="panel empty"><h3>No assessment yet</h3><p>Load a sample or enter measurements and run demo screening first.</p><button className="primary" type="button" onClick={()=>setView("Batch assessment")}>Go to batch assessment</button></section>}</> : <section className="panel planner"><div className="panel-heading"><h2>From barriers to next steps</h2><span className="pill amber">Planned workflow</span></div><div className="planner-content"><p className="planner-intro">Treatment recommendations need a supported assessment first. This is the structure of the future workflow.</p><ol className="steps">{[["Identify the barrier", "Connect a measured result or missing test to a documented pathway criterion."], ["Review treatment considerations", "Show supporting sources, preconditions and limitations for each option."], ["Confirm with further testing", "Keep original measurements separate from any simulated outcomes."]].map(([title, text], index) => <li key={title}><span className="step-number">{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol><div className="evidence"><strong>No treatment plan generated</strong><p>Treatment selection, simulations and economic calculations are future-stage features.</p></div><button type="button" className="secondary" onClick={() => setView("Batch assessment")}>Return to batch assessment</button></div></section>}
    <footer><strong>Decision support, not reuse certification.</strong><span>Stage 4 · No data persists after refresh</span></footer></main></div>
  </div>;
}






