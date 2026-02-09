const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const tokens = new URLSearchParams(window.location.search).get("tokens");
document.getElementById("tokens").innerText = tokens;

let cases = [];

fetch("https://ТВОЙ_СЕРВЕР:8000/cases")
  .then(res => res.json())
  .then(data => {
    cases = data;
    renderCases();
  });

function renderCases() {
  const el = document.getElementById("cases-list");
  el.innerHTML = "";

  cases.forEach(c => {
    el.innerHTML += `
      <div class="case">
        <h2>${c.title}</h2>
        <p>${c.description}</p>
        <button onclick="openCase(${c.id})">▶️ Участвовать</button>
      </div>
    `;
  });
}

function openCase(id) {
  const c = cases.find(x => x.id === id);
  const el = document.getElementById("case-view");
  el.innerHTML = "";

  c.experts.forEach(e => {
    el.innerHTML += `
      <button onclick="vote(${id}, '${e.id}')">
        ${e.name}<br><small>${e.text}</small>
      </button>
    `;
  });

  el.innerHTML += `
    <button onclick="custom(${id})">✍️ Свой прогноз</button>
  `;
}

function vote(caseId, choice) {
  tg.sendData(JSON.stringify({ case_id: caseId, choice }));
}

function custom(caseId) {
  const text = prompt("Введите прогноз");
  if (!text) return;
  tg.sendData(JSON.stringify({
    case_id: caseId,
    choice: "custom",
    text
  }));
}







