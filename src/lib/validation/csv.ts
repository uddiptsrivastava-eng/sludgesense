import { validateBatch, MAX_ROWS, type Issue, type RawBatch, type RawObservation } from "./index";
import type { SludgeBatch } from "../types";
export const CSV_HEADERS = ["batch_id","sampled_at","treatment_history","parameter","value","unit","basis","method","analyte","qualifier","detection_limit","provenance","notes"] as const;
/** RFC-style quoted fields including embedded newlines, commas and escaped quotes. */
export function parseCSV(text: string): {cells:string[]; row:number}[] {
  text = text.replace(/^\uFEFF/, "");
  const records: {cells:string[];row:number}[] = []; let cells:string[] = [], field="", quoted=false, closed=false, line=1, start=1;
  const push = () => { cells.push(field); if (cells.some(c=>c.trim()!=="")) records.push({cells,row:start}); cells=[];field="";closed=false; if(records.length>MAX_ROWS+1) throw new Error(`Maximum ${MAX_ROWS} data rows exceeded.`); };
  for(let i=0;i<text.length;i++) { const c=text[i];
    if(quoted) { if(c==='"') {if(text[i+1]==='"'){field+='"';i++;}else {quoted=false;closed=true;}} else {field+=c;if(c==='\n')line++;} continue; }
    if(c===','){cells.push(field);field="";closed=false;continue;}
    if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;push();line++;start=line;continue;}
    if(closed) throw new Error(`Row ${line}: unexpected character after closing quote.`);
    if(c==='"'){if(field)throw new Error(`Row ${line}: quote inside an unquoted field.`);quoted=true;}else field+=c;
  }
  if(quoted)throw new Error(`Row ${start}: unclosed quoted field.`);
  if(field || cells.length || closed)push();
  return records;
}
export interface ImportResult { batches: SludgeBatch[]; errors: Issue[]; warnings: Issue[]; rows: number; }
export function importCSV(text: string): ImportResult {
  const result:ImportResult={batches:[],errors:[],warnings:[],rows:0}; let records:ReturnType<typeof parseCSV>;
  try {records=parseCSV(text);}catch(e){result.errors.push({field:"CSV",message:(e as Error).message});return result;}
  if(!records.length){result.errors.push({field:"CSV",message:"The file is empty."});return result;}
  const headers=records[0].cells.map(c=>c.trim());
  if(headers.length!==CSV_HEADERS.length || new Set(headers).size!==headers.length || CSV_HEADERS.some(h=>!headers.includes(h))) {result.errors.push({row:records[0].row,field:"header",message:`Use each template column exactly once: ${CSV_HEADERS.join(", ")}.`});return result;}
  const groups=new Map<string,RawBatch>();
  for(const record of records.slice(1)){
    result.rows++;
    if(record.cells.length!==headers.length){result.errors.push({row:record.row,field:"CSV",message:`Expected ${headers.length} columns, found ${record.cells.length}.`});continue;}
    const r=Object.fromEntries(headers.map((h,i)=>[h,record.cells[i]])); const id=r.batch_id.trim();
    if(!id){result.errors.push({row:record.row,field:"batch_id",message:"Batch identifier is required."});continue;}
    const current=groups.get(id);
    if(current && (current.sampledAt!==r.sampled_at.trim() || current.treatmentHistory!==r.treatment_history.trim())) {result.errors.push({row:record.row,field:"batch metadata",message:"Rows for the same batch must have identical sampling date and treatment history."});continue;}
    const batch=current ?? {id,sampledAt:r.sampled_at.trim(),treatmentHistory:r.treatment_history.trim(),observations:[]};
    const o:RawObservation={parameter:r.parameter.trim(),value:r.value,unit:r.unit,basis:r.basis,method:r.method,analyte:r.analyte,qualifier:r.qualifier,detectionLimit:r.detection_limit,provenance:r.provenance.trim(),notes:r.notes,row:record.row};batch.observations.push(o);groups.set(id,batch);
  }
  for(const raw of groups.values()){const checked=validateBatch(raw);result.errors.push(...checked.errors.map(e=>({...e,row:e.row??raw.observations[0]?.row})));result.warnings.push(...checked.warnings.map(w=>({...w,row:w.row??raw.observations[0]?.row})));result.batches.push(checked.batch);}
  if(!result.rows)result.errors.push({field:"CSV",message:"Add at least one data row below the header."});
  return result;
}
