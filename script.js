let tg = window.Telegram.WebApp;
let currentCaseId = null;
let selectedChoice = null;

tg.expand();
tg.ready(); // Сообщаем системе, что Mini App загружен

// Парсим данные из URL
const urlParams = new URLSearchParams(window.location.search);
let rawData = {};
try {
    rawData = JSON.parse(decodeURIComponent(urlParams.get('data') || "{}"));
} catch (e) {
    console.error("Ошибка парсинга данных:", e);
}

let tokens = rawData.tokens || 0;
const casesData = rawData.cases || [];
const userVotes = rawData.user_votes || {}; 

document.getElementById('tokenCount').innerText = tokens;

function renderCases() {
    const list = document.getElementById('caseList');
    list.innerHTML = '';
    
    if (casesData.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding:20px;">Кейсов пока нет...</p>';
        return;
    }

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
    if (!c) return;
    
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
            <div class="expert-card" style="border: 2px solid #007bff; background: #f0f9ff;">
                <p style="color: #007bff; font-weight: bold; margin-bottom: 5px;">✅ Прогноз принят</p>
                <h3>${choiceText}</h3>
                ${hasVoted.text ? `<p style="font-style: italic;">"${hasVoted.text}"</p>` : ''}
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
                    <span>Заморожено: <b>${hasVoted.bet} 💎</b></span>
                </div>
            </div>
            <div class="back-link" onclick="backToList()">← Назад к списку</div>
        `;
    } else {
        view.innerHTML = `
            <div class="expert-card" onclick="prepareVote('expert_1', '${c.experts[0].name}')">
                <h3>${c.experts[0].name}</h3><p>${c.experts[0].text}</p>
            </div>
            <div class="expert-card" onclick="prepareVote('expert_2', '${c.experts[1].name}')">
                <h3>${c.experts[1].name}</h3><p>${c.experts[1].text}</p>
            </div>
            <button class="custom-btn" onclick="prepareVote('custom', 'Ваш вариант')">✍️ Свой вариант (+1 💎)</button>
            <div class="back-link" onclick="backToList()">← Назад к списку</div>
        `;
    }
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
    const totalCost = betValue + (selectedChoice === 'custom' ? 1 : 0);

    if (totalCost > tokens) {
        tg.showAlert(`Недостаточно токенов! Баланс: ${tokens} 💎`);
        return;
    }

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
    document.getElementById('mainTitle').innerText = "Кейсы";
}

renderCases();