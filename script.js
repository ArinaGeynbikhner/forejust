let tg = window.Telegram.WebApp;
tg.expand();

// 1. Извлекаем данные из URL
const urlParams = new URLSearchParams(window.location.search);
const userTokens = parseInt(urlParams.get('tokens') || '0');
const casesData = JSON.parse(urlParams.get('cases') || '[]');

// Элементы страницы
const tokensSpan = document.getElementById('tokens');
const casesList = document.getElementById('cases-list');
const caseView = document.getElementById('case-view');
const customModal = document.getElementById('customModal');
const customText = document.getElementById('customText');

// Состояние
let currentCaseId = null;

// Устанавливаем баланс
tokensSpan.innerText = userTokens;

// 2. Отрисовка списка кейсов
function renderList() {
    casesList.innerHTML = '';
    casesData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'case-card'; // Проверь, что в style.css есть такой класс
        card.innerHTML = `
            <h2>${item.title}</h2>
            <p>${item.description}</p>
            <button class="main-button" onclick="openCase(${item.id})">Участвовать</button>
        `;
        casesList.appendChild(card);
    });
}

// 3. Открытие конкретного кейса
window.openCase = function(id) {
    const c = casesData.find(item => item.id === id);
    if (!c) return;

    currentCaseId = id;
    casesList.style.display = 'none';
    caseView.style.display = 'block';

    caseView.innerHTML = `
        <button class="back-link" onclick="backToList()">← Назад к списку</button>
        <div class="case-full">
            <h2>${c.title}</h2>
            <p>${c.description}</p>
            
            <div class="experts-container">
                <div class="expert-card" onclick="sendVote('expert_1')">
                    <strong>${c.experts[0].name}</strong>
                    <p>${c.experts[0].text}</p>
                </div>
                <div class="expert-card" onclick="sendVote('expert_2')">
                    <strong>${c.experts[1].name}</strong>
                    <p>${c.experts[1].text}</p>
                </div>
            </div>

            <button class="custom-btn" onclick="openModal()">✍️ Написать свой прогноз (-1 💎)</button>
        </div>
    `;
};

// 4. Функции навигации и голосования
window.backToList = function() {
    caseView.style.display = 'none';
    casesList.style.display = 'block';
};

window.sendVote = function(choice) {
    const data = {
        case_id: currentCaseId,
        choice: choice
    };
    tg.sendData(JSON.stringify(data));
};

// 5. Работа с модальным окном
window.openModal = function() {
    customModal.style.display = 'flex';
};

window.closeModal = function() {
    customModal.style.display = 'none';
    customText.value = '';
};

window.submitCustom = function() {
    const text = customText.value.trim();
    if (!text) return alert("Введите текст прогноза!");

    const data = {
        case_id: currentCaseId,
        choice: 'custom',
        text: text
    };
    tg.sendData(JSON.stringify(data));
    closeModal();
};

// Запуск отрисовки
renderList();
