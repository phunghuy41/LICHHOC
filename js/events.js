import {dateKey,timeToMin,uid} from "./date.js";
export function eventForDate(events,date){
  const key=dateKey(date), dow=(date.getDay()+6)%7;
  return events.filter(e=>e.date===key || (e.repeat&&e.weekdays?.includes(dow)&&new Date(e.startDate||e.date)<=new Date(key+"T23:59:59") && !e.exceptions?.includes(key)))
    .filter(e=>!e.repeat || !e.exceptions?.includes(key))
    .map(e=>e.repeat?{...e,id:`${e.id}:${key}`,sourceId:e.id,date:key}:e)
    .sort((a,b)=>timeToMin(a.start)-timeToMin(b.start));
}
export function createEvent(data){return {id:uid(),subject:data.subject.trim(),date:data.date,start:data.start,end:data.end,location:data.location.trim(),color:data.color,repeat:data.repeat,weekdays:data.weekdays, startDate:data.startDate||data.date,exceptions:[],note:data.note||""}}
export function baseEventId(e){return e.sourceId||e.id}
