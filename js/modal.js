import {openModal,closeModal,$,escapeHTML} from "./ui.js";
import {dateKey,uid} from "./date.js";
export function eventModal({event=null,date,onSave,onDelete}){
 const d=event?.date||dateKey(date);
 openModal(`<button class="modal-close" id="mClose">×</button><h3>${event?"Chỉnh lịch":"Thêm buổi học"}</h3><p class="modal-sub">${event?"Cập nhật buổi học của bạn.":"Tạo một lịch học mới — mọi thay đổi sẽ được lưu trên thiết bị."}</p>
 <form id="eventForm" class="form-grid">
 <div class="field"><label>MÔN / NỘI DUNG</label><input id="fSubject" required value="${escapeHTML(event?.subject||"")} " placeholder="Ví dụ: Toán"></div>
 <div class="form-grid" style="grid-template-columns:1fr 1fr"><div class="field"><label>NGÀY</label><input id="fDate" type="date" required value="${d}"></div><div class="field"><label>ĐỊA ĐIỂM</label><input id="fLocation" value="${escapeHTML(event?.location||"")}" placeholder="Nhà cô / Online"></div></div>
 <div class="form-grid" style="grid-template-columns:1fr 1fr"><div class="field"><label>BẮT ĐẦU</label><input id="fStart" type="time" required value="${event?.start||"17:30"}"></div><div class="field"><label>KẾT THÚC</label><input id="fEnd" type="time" required value="${event?.end||"19:00"}"></div></div>
 <div class="field"><label>MÀU</label><div class="choice-row">${["#758cf0","#a88be8","#69bda5","#e8b66b","#df8db0","#65b7d0"].map(c=>`<button type="button" class="choice color-choice ${(event?.color||"#758cf0")===c?"selected":""}" data-color="${c}" style="--c:${c}">●</button>`).join("")}</div></div>
 <div class="field"><label>GHI CHÚ CHO BUỔI NÀY</label><textarea id="fNote" placeholder="Ví dụ: mang tài liệu...">${escapeHTML(event?.note||"")}</textarea></div>
 <div class="field"><label><input id="fRepeat" type="checkbox" ${event?.repeat?"checked":""}> Lặp hàng tuần</label></div>
 <div class="form-actions">${event?'<button type="button" class="danger-btn" id="deleteEvent">Xóa</button>':""}<span style="flex:1"></span><button type="button" class="secondary-btn" id="cancelEvent">Hủy</button><button class="primary-btn">Lưu lịch ✦</button></div>
 </form>`);
 $("#mClose").onclick=closeModal;$("#cancelEvent").onclick=closeModal;
 let color=event?.color||"#758cf0";document.querySelectorAll(".color-choice").forEach(b=>b.onclick=()=>{document.querySelectorAll(".color-choice").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");color=b.dataset.color});
 $("#eventForm").onsubmit=e=>{e.preventDefault();const s=$("#fStart").value,en=$("#fEnd").value;if(s>=en)return alert("Giờ kết thúc phải sau giờ bắt đầu.");onSave({...(event||{id:uid(),exceptions:[]}),subject:$("#fSubject").value,date:$("#fDate").value,location:$("#fLocation").value,start:s,end:en,color,note:$("#fNote").value,repeat:$("#fRepeat").checked,weekdays:event?.weekdays||[(new Date($("#fDate").value+"T12:00")).getDay()===0?6:(new Date($("#fDate").value+"T12:00")).getDay()-1]});closeModal()};
 if(event)$("#deleteEvent").onclick=()=>{if(confirm("Xóa buổi học này?")){onDelete(event);closeModal()}};
}
export function taskModal(onSave){openModal(`<button class="modal-close" id="mClose">×</button><h3>Thêm việc cần làm</h3><p class="modal-sub">Một việc nhỏ cũng đáng được ghi lại.</p><form id="taskForm" class="form-grid"><div class="field"><label>NỘI DUNG</label><input id="taskText" required placeholder="Ví dụ: Làm bài Toán"></div><div class="field"><label>NGÀY</label><input id="taskDate" type="date" value="${dateKey(new Date())}"></div><div class="form-actions"><button type="button" class="secondary-btn" id="cancelTask">Hủy</button><button class="primary-btn">Thêm ✦</button></div></form>`);$("#mClose").onclick=closeModal;$("#cancelTask").onclick=closeModal;$("#taskForm").onsubmit=e=>{e.preventDefault();onSave({id:uid(),text:$("#taskText").value,date:$("#taskDate").value,done:false});closeModal()}}
