"use client";
import { useRef, useState } from "react";
import { importCSV, type ImportResult } from "@/lib/validation/csv";
import { MAX_FILE_BYTES, MAX_ROWS } from "@/lib/validation";
import type { SludgeBatch } from "@/lib/types";
export default function CSVImport({onImport}:{onImport:(batches:SludgeBatch[])=>void}) {
  const [result,setResult]=useState<ImportResult|null>(null), [busy,setBusy]=useState(false), [error,setError]=useState(""), [name,setName]=useState(""), [loaded,setLoaded]=useState(false);
  const request=useRef(0);
  async function read(file:File|undefined) {
    const token=++request.current;setResult(null);setError("");setLoaded(false);setName(file?.name??"");setBusy(false);
    if(!file)return;
    if(!/\.csv$/i.test(file.name)){setError("Choose a .csv file using the downloadable template.");return;}
    if(file.size>MAX_FILE_BYTES){setError("File exceeds the 1 MB limit.");return;}
    setBusy(true);
    try{const text=await file.text();if(token===request.current)setResult(importCSV(text));}catch{if(token===request.current)setError("Unable to read this file. Try saving it as UTF-8 CSV.");}finally{if(token===request.current)setBusy(false);}
  }
  return <section className="csv-import" aria-labelledby="csv-title"><h3 id="csv-title">Import batch measurements</h3><p className="small">CSV stays in this browser. Up to 1 MB and {MAX_ROWS} measurement rows. Loading an import replaces the current draft.</p><div className="download-links"><a href="/samples/template.csv" download>Download template</a><a href="/samples/synthetic-batches.csv" download>Incomplete example</a><a href="/samples/screening-batches.csv" download>Screening samples</a></div><label className="field" htmlFor="csv-file">Choose CSV<input id="csv-file" type="file" accept=".csv,text/csv" disabled={busy} onChange={e=>read(e.target.files?.[0])}/></label><div aria-live="polite" aria-busy={busy}>{busy&&<p>Reading CSV…</p>}{error&&<p className="error" role="alert">{error}</p>}{result&&<div><p><strong>{name}</strong> · {result.rows} rows · {result.batches.length} batches</p>{result.errors.length>0&&<div className="error" role="alert"><strong>{result.errors.length} errors — import blocked</strong><ul>{result.errors.slice(0,30).map((e,i)=><li key={i}>{e.row?`Row ${e.row} · `:""}{e.field}: {e.message}</li>)}</ul>{result.errors.length>30&&<p>Showing the first 30 errors. Fix these and select the file again.</p>}</div>}{result.warnings.length>0&&<details><summary>{result.warnings.length} missing-context warnings</summary><ul className="small">{result.warnings.slice(0,30).map((w,i)=><li key={i}>{w.row?`Row ${w.row} · `:""}{w.field}: {w.message}</li>)}</ul></details>}{result.batches.length>0&&<div className="import-table"><table><caption>Import preview — no suitability assessed</caption><thead><tr><th>Batch</th><th>Observations</th><th>Sampling date</th></tr></thead><tbody>{result.batches.map(b=><tr key={b.id}><td>{b.id}</td><td>{Object.values(b.measurements).flat().length}</td><td>{b.sampledAt??"Unknown"}</td></tr>)}</tbody></table></div>}<button type="button" className="secondary full" disabled={!!result.errors.length||!result.batches.length||loaded} onClick={()=>{onImport(result.batches);setLoaded(true);}}>{loaded?"Imported into session":"Load validated batches"}</button>{loaded&&<p role="status" className="small">Batches loaded. Use the imported batch selector below.</p>}</div>}</div></section>;
}

