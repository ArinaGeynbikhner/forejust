const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let tokens = parseInt(new URLSearchParams(window.location.search).get("tokens")) || 0;
document.getElementById("tokens").innerText = tokens;

const cases = [
    { id: 1, title: "Выборы в X", experts: [{id:"expert_1",name:"A"},{id:"expert_2",name:"B"}] },
    { id: 2, title: "Санкции против Y", experts: [{id:"expert_1",name:"A"},{id:"expert_2",name:"B"}] }
];

const listEl = document.getElementById("cases-list");
const viewEl = document.getElementById("case-view");
let currentCaseId = null;

function renderCases() {
    listEl.innerHTML = "";
    cases.forEach(c=>{
        const div = document.createElement("div");
        div.innerHTML = `<h2>${c.title}</h2><button onclick="openCase(${c.id})">▶️ Участвовать</button>`;
        listEl.appendChild(div);
    });
}
function openCase(id){
    const c = cases.find(x=>x.id===id);
    listEl.style.display="none";
    viewEl.style.display="block";
    currentCaseId=id;
    viewEl.innerHTML=c.experts.map(e=>`<button onclick="vote('${e.id}')">${e.name}</button>`).join("")+`<button onclick="customVote()">Свой прогноз</button>`;
}
function vote(expert){
    tg.sendData(JSON.stringify({case_id:currentCaseId,choice:expert,tokens:tokens}));
    alert("Голос отправлен!");
}
function customVote(){
    if(tokens<=0){alert("Недостаточно токенов"); return;}
    const text = prompt("Ваш прогноз:");
    if(text && text.length>=3){
        tokens--; document.getElementById("tokens").innerText=tokens;
        tg.sendData(JSON.stringify({case_id:currentCaseId,choice:"custom",text:text,tokens:tokens}));
        alert("Прогноз отправлен!");
    }
}
renderCases();




