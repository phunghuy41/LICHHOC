export function applyTheme(settings){let t=settings.theme;if(t==="system")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;document.querySelector("#themeBtn").textContent=t==="dark"?"☀️":"🌙"}
export function cycleTheme(settings){settings.theme=settings.theme==="light"?"dark":settings.theme==="dark"?"system":"light";applyTheme(settings)}
