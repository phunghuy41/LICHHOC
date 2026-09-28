import {load,save,exportData,importData} from "./storage.js";
import {dateKey,parseKey,addDays,startOfWeek,fmtDate,fmtShort,timeToMin,uid} from "./date.js";
import {applyTheme,cycleTheme} from "./theme.js";
import {$,$$,toast,escapeHTML,closeModal,openModal} from "./ui.js";
import {eventForDate,baseEventId} from "./events.js";
import {eventModal,taskModal} from "./modal.js";

let state=load(), selectedDate=new Date(), weekStart=startOfWeek(selectedDate);
const dowNames=["T2","T3","T4","T5","T6","T7","CN"];
const colorBySubject=s=>state.subjects[s]?.color||null;

function persist(){save(state)}
function allDateEvents(d){return eventForDate(state.events,d)}
function findStored(id){return state.events.find(e=>e.id===id)||state.events.find(e=>e.id===id.split(":")[0])}

function render(){
  renderHeader();renderToday();renderWeek();renderNote();renderTasks();applyTheme(state.settings);
}
function renderHeader(){
 const now=new Date(), h=now.getHours();
 $("#greeting").textContent=(h<12?"CHÀO BUỔI SÁNG ✦":h<18?"CHÀO BUỔI CHIỀU ✦":"CHÀO BUỔI TỐI ✦");
 $("#todayTitle").textContent=selectedDate.toDateString()===now.toDateString()?"Hôm nay":selectedDate.toLocaleDateString("vi-VN",{weekday:"long"});
 $("#todayDate").textContent=fmtDate(selectedDate);
 $("#clock").textContent=now.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});
}
function renderToday(){
 const list=allDateEvents(selectedDate), now=new Date(), todayKey=dateKey(now);
 const isToday=dateKey(selectedDate)===todayKey;
 let next=list.find(e=>!isToday||timeToMin(e.end)>now.getHours()*60+now.getMinutes())||null;
 if(next){$("#nextMain").innerHTML=`<div class="next-subject">${escapeHTML(next.subject)}</div><div class="next-meta">🕐 ${next.start} — ${next.end}${next.location?` · 📍 ${escapeHTML(next.location)}`:""}</div>`;$("#nextCountdown").textContent=isToday?countdown(next):`${next.start} · ${fmtShort(selectedDate)}`;$("#nextCard").dataset.id=next.id;$("#nextProgress").style.width=isToday?progress(next)+"%":"0%";}else{$("#nextMain").innerHTML=`<div class="next-subject">Không còn buổi học ✦</div><div class="next-meta">${list.length?"Bạn đã hoàn thành lịch hôm nay.":"Ngày này đang trống."}</div>`;$("#nextCountdown").textContent="Một chút thời gian cho bạn.";$("#nextProgress").style.width="0%"}
 $("#todayTimeline").innerHTML=list.length?list.map(e=>eventHTML(e,isToday)).join(""):`<div class="empty glass">Chưa có lịch cho ngày này.<br><button class="soft-btn" style="margin-top:10px" id="emptyAdd">＋ Thêm buổi học</button></div>`;
 bindEventCards();
 const n=list.filter(e=>timeToMin(e.start)<(new Date().getHours()*60+new Date().getMinutes())).length;$("#heroStatus").textContent=isToday?`${list.length} buổi hôm nay · ${n} đã qua`:`${list.length} buổi trong ngày`;
 $("#emptyAdd")?.addEventListener("click",()=>openEvent());
}
function eventHTML(e,isToday=false){
 const now=new Date(), cur=isToday&&timeToMin(e.start)<=now.getHours()*60+now.getMinutes()&&timeToMin(e.end)>now.getHours()*60+now.getMinutes(),past=isToday&&timeToMin(e.end)<=now.getHours()*60+now.getMinutes();
 return `<article class="event-card pop" data-id="${e.id}" data-current="${cur}" data-past="${past}" style="--event-color:${e.color||"var(--accent)"}"><div class="event-time">${e.start}<small style="display:block;color:var(--muted);font-size:11px">${e.end}</small></div><div><div class="event-subject"><span class="event-dot"></span>${escapeHTML(e.subject)}</div><div class="event-meta">${e.location?`📍 ${escapeHTML(e.location)}`:""}${e.note?" · ✎ Có ghi chú":""}</div></div><div class="event-actions"><button class="tiny-btn edit-btn">✎</button></div></article>`
}
function bindEventCards(){$$(".event-card").forEach(c=>c.querySelector(".edit-btn").onclick=()=>openEvent(findStored(c.dataset.id)))}
function openEvent(event=null,date=selectedDate){eventModal({event,date,onSave:e=>{const i=state.events.findIndex(x=>x.id===e.id);if(i<0)state.events.push(e);else state.events[i]=e;persist();render();toast(i<0?"✦ Đã thêm lịch":"✦ Đã cập nhật lịch")},onDelete:e=>{state.events=state.events.filter(x=>x.id!==baseEventId(e));persist();render();toast("Đã xóa lịch")}})}
function renderWeek(){
 const dates=Array.from({length:7},(_,i)=>addDays(weekStart,i)), selectedKey=dateKey(selectedDate);
 $("#weekLabel").textContent=`${fmtShort(dates[0])} — ${fmtShort(dates[6])}`;
 $("#weekStrip").innerHTML=dates.map((d,i)=>`<button class="day-chip ${dateKey(d)===selectedKey?"active":""}" data-date="${dateKey(d)}"><b>${dowNames[i]}</b><small>${d.getDate()}</small></button>`).join("");
 $$(".day-chip").forEach(b=>b.onclick=()=>{selectedDate=parseKey(b.dataset.date);render()});
 const rows=dates.flatMap((d,i)=>allDateEvents(d).map(e=>({...e,day:d,di:i})));
 $("#weekList").innerHTML=rows.length?rows.map(e=>`<div class="week-row"><span><b>${dowNames[e.di]} · ${e.start}</b> ${escapeHTML(e.subject)}</span><small>${e.location?escapeHTML(e.location):"—"}</small></div>`).join(""):`<div class="empty-small">Tuần này chưa có lịch ✦</div>`;
}
function renderNote(){
 const key=dateKey(selectedDate);$("#noteTitle").textContent=`Ghi chú ${selectedDate.toLocaleDateString("vi-VN",{weekday:"long"})}`;$("#noteInput").value=state.notes[key]||"";
}
function renderTasks(){
 const key=dateKey(selectedDate), tasks=state.tasks.filter(t=>t.date===key);
 $("#taskList").innerHTML=tasks.map(t=>`<div class="task-item"><input type="checkbox" ${t.done?"checked":""} data-task="${t.id}"><span class="task-text ${t.done?"task-done":""}">${escapeHTML(t.text)}</span><button class="tiny-btn task-del" data-id="${t.id}">×</button></div>`).join("");
 $("#taskEmpty").style.display=tasks.length?"none":"block";
 $$("#taskList input").forEach(i=>i.onchange=()=>{const t=state.tasks.find(x=>x.id===i.dataset.task);t.done=i.checked;persist();renderTasks()});
 $$(".task-del").forEach(b=>b.onclick=()=>{state.tasks=state.tasks.filter(t=>t.id!==b.dataset.id);persist();renderTasks()});
}
function progress(e){const a=timeToMin(e.start),b=timeToMin(e.end),n=new Date(),m=n.getHours()*60+n.getMinutes();return Math.max(0,Math.min(100,(m-a)/(b-a)*100))}
function countdown(e){const n=new Date(),m=n.getHours()*60+n.getMinutes(),s=n.getSeconds(),t=timeToMin(e.start);let diff=t*60-(m*60+s);if(diff<=0)return `Đang học · kết thúc ${e.end}`;const h=Math.floor(diff/3600),mi=Math.floor(diff%3600/60),se=diff%60;return h?`Còn ${h}h ${mi}m`: `Còn ${mi}m ${se}s`}
function tick(){renderHeader();if(dateKey(selectedDate)===dateKey(new Date()))renderToday()}

$("#themeBtn").onclick=()=>{cycleTheme(state.settings);persist()};
$("#quickAddBtn").onclick=$("#addTodayBtn").onclick=$("#bottomAdd").onclick=()=>openEvent();
$("#prevWeek").onclick=()=>{weekStart=addDays(weekStart,-7);selectedDate=new Date(weekStart);render()};
$("#nextWeek").onclick=()=>{weekStart=addDays(weekStart,7);selectedDate=new Date(weekStart);render()};
$("#noteInput").oninput=e=>{state.notes[dateKey(selectedDate)]=e.target.value;persist();$("#noteState").textContent="Đã lưu ✓";clearTimeout(window.noteTimer);window.noteTimer=setTimeout(()=>$("#noteState").textContent="Tự lưu",900)};
$("#addTaskBtn").onclick=()=>taskModal(t=>{state.tasks.push(t);persist();renderTasks();toast("✓ Đã thêm việc")});
$("#homeBtn").onclick=()=>{selectedDate=new Date();weekStart=startOfWeek(selectedDate);render()};
$("#nextDetails").onclick=()=>{$("#nextCard").scrollIntoView({behavior:"smooth"})};
$$(".nav-item").forEach(b=>b.onclick=()=>{const v=b.dataset.view;if(v==="today"){selectedDate=new Date();weekStart=startOfWeek(selectedDate);render()}else if(v==="week")$("#weekList").scrollIntoView({behavior:"smooth"});else if(v==="tasks")$("#taskList").scrollIntoView({behavior:"smooth"});else settingsModal();$$(".nav-item").forEach(x=>x.classList.toggle("active",x===b))});

function settingsModal(){
 openModal(`<button class="modal-close" id="mClose">×</button><h3>Cài đặt</h3><p class="modal-sub">LumiSchedule lưu dữ liệu ngay trên thiết bị của bạn.</p>
 <div class="form-grid">
 <div class="field"><label>GIAO DIỆN</label><div class="choice-row"><button class="choice ${state.settings.theme==="light"?"selected":""}" data-t="light">☀️ Sáng</button><button class="choice ${state.settings.theme==="dark"?"selected":""}" data-t="dark">🌙 Tối</button><button class="choice ${state.settings.theme==="system"?"selected":""}" data-t="system">◐ Theo máy</button></div></div>
 <div class="field"><label>HIỆU ỨNG</label><label><input id="effects" type="checkbox" ${state.settings.effects?"checked":""}> Hiệu ứng nền và chuyển động</label></div>
 <div class="field"><label>BACKUP DỮ LIỆU</label><div class="choice-row"><button class="secondary-btn" id="exportBtn">📤 Xuất file</button><button class="secondary-btn" id="importBtn">📥 Nhập file</button><input id="importFile" type="file" accept=".json" hidden></div></div>
 <div class="field"><label>VÙNG NGUY HIỂM</label><button class="danger-btn" id="clearBtn">Xóa toàn bộ dữ liệu</button></div></div>`);
 $("#mClose").onclick=closeModal;
 $$("[data-t]").forEach(b=>b.onclick=()=>{state.settings.theme=b.dataset.t;persist();applyTheme(state.settings);settingsModal()});
 $("#effects").onchange=e=>{state.settings.effects=e.target.checked;document.body.classList.toggle("no-effects",!e.target.checked);persist()};
 $("#exportBtn").onclick=()=>exportData(state);
 $("#importBtn").onclick=()=>$("#importFile").click();
 $("#importFile").onchange=async e=>{try{const incoming=await importData(e.target.files[0]);state={...state,...incoming};persist();closeModal();render();toast("✦ Đã khôi phục dữ liệu")}catch{toast("Không đọc được file","bad")}};
 $("#clearBtn").onclick=()=>{if(confirm("Xóa toàn bộ lịch, ghi chú và việc cần làm?")){localStorage.clear();location.reload()}};
}

for(let i=0;i<65;i++){const s=document.createElement("i");s.className="star";s.style.left=Math.random()*100+"%";s.style.top=Math.random()*100+"%";s.style.animationDelay=(-Math.random()*3)+"s";$("#stars").append(s)}
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();if(e.key==="n"&&!e.ctrlKey&&!e.metaKey)openEvent()});
$("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
render();setInterval(tick,1000);
