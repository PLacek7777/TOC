async function loadLogs(){
  const r = await fetch("/logs");
  const logs = await r.json();
  const c = document.getElementById("logs");
  c.innerHTML = "";
  logs.reverse().forEach(l=>{
    let d="";
    for(const k in l.dane){
      d+=`<div>${k}: ${l.dane[k]}</div>`;
    }
    c.innerHTML+=`
      <details class="log">
        <summary>[${l.czas}] ${l.jednostka} | ${l.typ}</summary>
        ${d}
      </details>`;
  });
}

loadLogs();
setInterval(loadLogs, 3000);
