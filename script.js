let tg = window.Telegram.WebApp;
let currentCaseId = null;
let selectedChoice = null;

tg.expand();

const urlParams = new URLSearchParams(window.location.search);
let tokens = parseInt(urlParams.get('tokens') || 0);
document.getElementById('tokenCount').innerText = tokens;
const casesData = JSON.parse(decodeURIComponent(urlParams.get('cases') || "[]"));

function renderCases() {
    const list = document.getElementById('caseList');
    list.innerHTML = '';
    casesData.forEach(c => {
        const div = document.createElement('div');
        div.className = 'case-card';
        div.innerHTML = `<h2>${c.title}</h2><p>${c.description}</p><button onclick="openCase(${c.id})">Сделать прогноз</button>`;
        list.appendChild(div);
    });
}

function openCase(id) {
    const c = casesData.find(item => item.id === id);
    currentCaseId = id;
    document.getElementById('caseList').classList.add('hidden');
    const view = document.getElementById('caseView');
    view.classList.remove('hidden');
    document.getElementById('mainTitle').innerText = c.title;

    view.innerHTML = `
        <div class="expert-card" onclick="prepareVote('expert_1', '${c.experts[0].name}')">
            <h3>${c.experts[0].name}</h3><p>${c.experts[0].text}</p>
        </div>
        <div class="expert-card" onclick="prepareVote('expert_2', '${c.experts[1].name}')">
            <h3>${c.experts[1].name}</h3><p>${c.experts[1].text}</p>
        </div>
        <button class="custom-btn" onclick="prepareVote('custom', 'Ваш вариант')">✍️ Написать свой вариант</button>
        <div class="back-link" onclick="backToList()">← Назад к списку кейсов</div>
    `;
}

function adjustBet(change) {
    const input = document.getElementById('manualBet');
    let val = parseInt(input.value) || 1;
    val += change;
    if (val < 1) val = 1;
    input.value = val;
}

function prepareVote(choice, title) {
    selectedChoice = choice;
    document.getElementById('modalTitle').innerText = title;
    const textArea = document.getElementById('customText');
    choice === 'custom' ? textArea.classList.remove('hidden') : textArea.classList.add('hidden');
    document.getElementById('modal').classList.remove('hidden');
}

document.getElementById('sendBtn').onclick = () => {
    const betValue = parseInt(document.getElementById('manualBet').value);
    const text = document.getElementById('customText').value;

    if (betValue > tokens) {
        tg.showAlert("Недостаточно токенов!");
        return;
    }

    tg.sendData(JSON.stringify({
        case_id: currentCaseId,
        choice: selectedChoice,
        text: selectedChoice === 'custom' ? text : "",
        bet: betValue
    }));
    tg.close();
};

document.getElementById('closeModal').onclick = () => {
    document.getElementById('modal').classList.add('hidden');
};

function backToList() {
    document.getElementById('caseView').classList.add('hidden');
    document.getElementById('caseList').classList.remove('hidden');
    document.getElementById('mainTitle').innerText = "Кейсы";
}

renderCases();