const KEY="lumiSchedule.v1";
const defaults={events:[],notes:{},tasks:[],subjects:{},settings:{theme:"system",effects:true,reminder:15}};
export function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return structuredClone(defaults)}}
export function save(state){localStorage.setItem(KEY,JSON.stringify(state))}
export function exportData(state){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`lumischedule-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
export function importData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{try{resolve(JSON.parse(r.result))}catch(e){reject(e)}};r.onerror=reject;r.readAsText(file)})}
