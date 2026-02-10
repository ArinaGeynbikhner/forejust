let tg = window.Telegram.WebApp;
let currentCaseId = null;
let selectedChoice = null;

tg.expand();

// Получаем данные из URL
const urlParams = new URLSearchParams(window.location.search);
const tokens = urlParams.get('tokens') || 0;
document.getElementById('tokenCount').innerText = tokens;

const casesData = JSON.parse(decodeURIComponent(urlParams.get('cases') || "[]"));

const caseList = document.getElementById('caseList');
const caseView = document.getElementById('caseView');
const modal = document.getElementById('modal');

function renderCases() {
    caseList.innerHTML = '';
    casesData.forEach(c => {
        const div = document.createElement('div');
        div.className = 'case-card';
        div.innerHTML = `
            <h2>${c.title}</h2>
            <p>${c.description}</p>
            <button onclick="openCase(${c.id})">Сделать прогноз</button>
        `;
        caseList.appendChild(div);
    });
}

function openCase(id) {
    const c = casesData.find(item => item.id === id);
    currentCaseId = id;
    caseList.classList.add('hidden');
    caseView.classList.remove('hidden');
    document.getElementById('mainTitle').innerText = "Выбор";

    caseView.innerHTML = `
        <div class="case-full">
            <div class="expert-card" onclick="prepareVote('expert_1', '${c.experts[0].name}')">
                <h3>${c.experts[0].name}</h3>
                <p>${c.experts[0].text}</p>
            </div>
            <div class="expert-card" onclick="prepareVote('expert_2', '${c.experts[1].name}')">
                <h3>${c.experts[1].name}</h3>
                <p>${c.experts[1].text}</p>
            </div>
            <button class="custom-btn" onclick="prepareVote('custom', 'Свой вариант')">✍️ Написать свой прогноз</button>
            <button class="custom-btn" style="background:#ccc" onclick="backToList()">⬅️ Назад</button>
        </div>
    `;
}

function prepareVote(choice, title) {
    selectedChoice = choice;
    document.getElementById('modalTitle').innerText = title;
    modal.classList.remove('hidden');
    
    // Показываем текстовое поле только если выбор "custom"
    if (choice === 'custom') {
        document.getElementById('customText').classList.remove('hidden');
    } else {
        document.getElementById('customText').classList.add('hidden');
    }
}

document.getElementById('sendBtn').onclick = () => {
    const bet = parseInt(document.getElementById('betAmount').value);
    const text = document.getElementById('customText').value;

    if (bet < 1 || bet > parseInt(tokens)) {
        tg.showAlert("Недостаточно токенов или неверная сумма!");
        return;
    }

    tg.sendData(JSON.stringify({
        case_id: currentCaseId,
        choice: selectedChoice,
        text: text,
        bet: bet
    }));
    tg.close();
};

document.getElementById('closeModal').onclick = () => {
    modal.classList.add('hidden');
};

function backToList() {
    caseView.classList.add('hidden');
    caseList.classList.remove('hidden');
    document.getElementById('mainTitle').innerText = "Кейсы";
}

renderCases();
