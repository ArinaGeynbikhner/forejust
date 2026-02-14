let tg = window.Telegram.WebApp;
let currentCaseId = null;
let selectedChoice = null;

tg.expand();
tg.ready();

// Читаем данные из URL
const urlParams = new URLSearchParams(window.location.search);
const dataParam = urlParams.get('data');
let rawData = {};

if (dataParam) {
    try {
        rawData = JSON.parse(decodeURIComponent(dataParam));
    } catch (e) {
        console.error("Data error:", e);
    }
}

let tokens = rawData.tokens || 0;
const casesData = rawData.cases || [];
const userVotes = rawData.user_votes || {};

document.getElementById('tokenCount').innerText = tokens;

function renderCases() {
    const list = document.getElementById('caseList');
    list.innerHTML = '';
    casesData.forEach(c => {
        const hasVoted = userVotes[c.id];
        const div = document.createElement('div');
        div.className = 'case-card';
        div.innerHTML = `
            <h2>${c.title}</h2>
            <p>${c.description}</p>
            <button onclick="openCase(${c.id})">${hasVoted ? '📊 Мой прогноз' : '🎮 Сделать прогноз'}</button>
        `;
        list.appendChild(div);
    });
}

function openCase(id) {
    const c = casesData.find(item => item.id === id);
    currentCaseId = id;
    const hasVoted = userVotes[id];
    
    document.getElementById('caseList').classList.add('hidden');
    const view = document.getElementById('caseView');
    view.classList.remove('hidden');
    document.getElementById('mainTitle').innerText = c.title;

    if (hasVoted) {
        let choiceText = hasVoted.choice === 'expert_1' ? c.experts[0].name : 
                         (hasVoted.choice === 'expert_2' ? c.experts[1].name : "Ваш вариант");

        view.innerHTML = `
            <div class="expert-card" style="border: 2px solid #007bff;">
                <p style="color: #007bff;">✅ Вы участвуете</p>
                <h3>${choiceText}</h3>
                <p>Ставка: ${hasVoted.bet} 💎</p>
            </div>
            <div class="back-link" onclick="backToList()">← Назад</div>
        `;
    } else {
        view.innerHTML = `
            <div class="expert-card" onclick="prepareVote('expert_1', '${c.experts[0].name}')">
                <h3>${c.experts[0].name}</h3><p>${c.experts[0].text}</p>
            </div>
            <div class="expert-card" onclick="prepareVote('expert_2', '${c.experts[1].name}')">
                <h3>${c.experts[1].name}</h3><p>${c.experts[1].text}</p>
            </div>
            <button class="custom-btn" onclick="prepareVote('custom', 'Ваш вариант')">✍️ Свой вариант</button>
            <div class="back-link" onclick="backToList()">← Назад</div>
        `;
    }
}

function prepareVote(choice, title) {
    selectedChoice = choice;
    document.getElementById('modalTitle').innerText = title;
    const textArea = document.getElementById('customText');
    choice === 'custom' ? textArea.classList.remove('hidden') : textArea.classList.add('hidden');
    document.getElementById('modal').classList.remove('hidden');
}

// РАБОЧАЯ КНОПКА ПОДТВЕРДИТЬ
document.getElementById('sendBtn').onclick = () => {
    const betValue = parseInt(document.getElementById('manualBet').value) || 1;
    const text = document.getElementById('customText').value;
    const totalCost = betValue + (selectedChoice === 'custom' ? 1 : 0);

    if (totalCost > tokens) {
        tg.showAlert("Недостаточно токенов!");
        return;
    }

    // ТЕПЕРЬ ЭТО СРАБОТАЕТ, т.к. открыто через Reply Button
    tg.sendData(JSON.stringify({
        case_id: currentCaseId,
        choice: selectedChoice,
        text: selectedChoice === 'custom' ? text : "",
        bet: betValue
    }));
};

document.getElementById('closeModal').onclick = () => {
    document.getElementById('modal').classList.add('hidden');
};

function backToList() {
    document.getElementById('caseView').classList.add('hidden');
    document.getElementById('caseList').classList.remove('hidden');
}

renderCases();