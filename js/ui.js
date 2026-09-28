export const $=s=>document.querySelector(s);export const $$=s=>[...document.querySelectorAll(s)];
export function toast(msg,type="good"){const box=$("#toastStack"),el=document.createElement("div");el.className=`toast ${type}`;el.textContent=msg;box.append(el);setTimeout(()=>el.remove(),2600)}
export function escapeHTML(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
export function openModal(html){$("#modal").innerHTML=html;$("#modalBackdrop").classList.add("open")}
export function closeModal(){$("#modalBackdrop").classList.remove("open");$("#modal").innerHTML=""}
