let UNITS = [];
let SCHEMAS = {};
let selectedUnit = "";
let logs = [];

async function loadConfig(){
  const r = await fetch("/config");
  const cfg = await r.json();
  UNITS = cfg.units;
  SCHEMAS = cfg.schemas;

  renderUnits();
  renderTypes();

  document.getElementById("units_edit").value = UNITS.join("\n");
  document.getElementById("schemas_edit").value =
    JSON.stringify(SCHEMAS, null, 2);
}

function renderUnits(){
  const c = document.getElementById("units");
  c.innerHTML = "";
  UNITS.forEach(u=>{
    const b = document.createElement("button");
    b.textContent = u;
    b.onclick = ()=>{
      selectedUnit = u;
      document.querySelectorAll("#units button").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
    };
    c.appendChild(b);
  });
}

function renderTypes(){
  const t = document.getElementById("type");
  t.innerHTML = "";
  Object.keys(SCHEMAS).forEach(k=>{
    t.innerHTML += `<option>${k}</option>`;
  });
  buildFields();
}

function buildFields(){
  const type = document.getElementById("type").value;
  const c = document.getElementById("fields");
  c.innerHTML = "";
  SCHEMAS[type].forEach(f=>{
    c.innerHTML += `
      <label>${f[1]}</label>
      <input data-key="${f[0]}">
    `;
  });
}

async function sendLog(){
  const data = {};
  document.querySelectorAll("#fields input").forEach(i=>{
    data[i.dataset.key] = i.value;
  });

  await fetch("/add",{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      unit:selectedUnit,
      type:document.getElementById("type").value,
      data:data
    })
  });

  loadLogs();
}

async function loadLogs() {
    const r = await fetch("/logs");
    let allLogs = await r.json();
    const newLogs = allLogs.filter(el1 =>
        !logs.some(el2 =>
            JSON.stringify(el1) === JSON.stringify(el2)
        )   
    );
    const c = document.getElementById("logs");
    newLogs.reverse().forEach(l=>{
        let d="";
        for(const k in l.dane){
            d+=`<div>${k}: ${l.dane[k]}</div>`;
        }
        let HTML=`
        <details class="log">
        <summary>[${l.czas}] ${l.jednostka} | ${l.typ}</summary>
        ${d}
        </details>`+c.innerHTML;
        c.innerHTML=HTML;
    });
    newLogs.forEach(log => logs.push(log));
}

document.getElementById("type").onchange = buildFields;
loadConfig();
loadLogs();
setInterval(loadLogs, 3000);
