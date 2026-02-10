let tg = window.Telegram.WebApp;
let currentCaseId = null;
let selectedChoice = null;
let currentBet = 1;

tg.expand();

const urlParams = new URLSearchParams(window.location.search);
const userTokens = parseInt(urlParams.get('tokens') || 0);
document.getElementById('tokenCount').innerText = userTokens;

const casesData = JSON.parse(decodeURIComponent(urlParams.get('cases') || "[]"));

function renderCases() {
    const list = document.getElementById('caseList');
    list.innerHTML = '';
    casesData.forEach(c => {
        const div = document.createElement('div');
        div.className = 'case-card';
        div.innerHTML = `
            <h2>${c.title}</h2>
            <p>${c.description}</p>
            <button onclick="openCase(${c.id})">Сделать прогноз</button>
        `;
        list.appendChild(div);
    });
}

function openCase(id) {
    const c = casesData.find(item => item.id === id);
    currentCaseId = id;
    document.getElementById('caseList').classList.add('hidden');
    const view = document.getElementById('caseView');
    view.classList.remove('hidden');
    document.getElementById('mainTitle').innerText = "Выбор мнения";

    view.innerHTML = `
        <div class="expert-card" onclick="prepareVote('expert_1', '${c.experts[0].name}')">
            <h3>${c.experts[0].name}</h3>
            <p>${c.experts[0].text}</p>
        </div>
        <div class="expert-card" onclick="prepareVote('expert_2', '${c.experts[1].name}')">
            <h3>${c.experts[1].name}</h3>
            <p>${c.experts[1].text}</p>
        </div>
        <button class="custom-btn" onclick="prepareVote('custom', 'Ваш собственный прогноз')">✍️ Написать свой вариант</button>
        <p onclick="backToList()" style="text-align:center; color:#888; margin-top:20px; cursor:pointer;">⬅️ К списку кейсов</p>
    `;
}

function setBet(amount) {
    currentBet = amount;
    document.getElementById('betAmount').value = amount;
    document.querySelectorAll('.bet-chip').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.innerText) === amount) btn.classList.add('active');
    });
}

function prepareVote(choice, title) {
    selectedChoice = choice;
    document.getElementById('modalTitle').innerText = title;
    
    const textArea = document.getElementById('customText');
    // Показываем текстовое поле только для 'custom'
    if (choice === 'custom') {
        textArea.classList.remove('hidden');
    } else {
        textArea.classList.add('hidden');
    }
    
    document.getElementById('modal').classList.remove('hidden');
}

document.getElementById('sendBtn').onclick = () => {
    const text = document.getElementById('customText').value;

    if (currentBet > userTokens) {
        tg.showAlert("Недостаточно токенов!");
        return;
    }

    if (selectedChoice === 'custom' && text.trim().length < 3) {
        tg.showAlert("Пожалуйста, напишите ваш прогноз.");
        return;
    }

    tg.sendData(JSON.stringify({
        case_id: currentCaseId,
        choice: selectedChoice,
        text: selectedChoice === 'custom' ? text : "",
        bet: currentBet
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
