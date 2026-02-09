// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Читаем параметры из URL, которые передал бот
const urlParams = new URLSearchParams(window.location.search);

// Токены
let tokens = parseInt(urlParams.get("tokens")) || 0;
const tokensEl = document.getElementById("tokens");
tokensEl.innerText = tokens;

// Кейсы — читаем из параметра cases (JSON-строка)
let cases = [];
const casesParam = urlParams.get("cases");
if (casesParam) {
    try {
        cases = JSON.parse(casesParam);
        // Если в кейсах есть поле is_active — фильтруем только активные
        cases = cases.filter(c => c.is_active !== false && c.is_active !== 0);
    } catch (e) {
        console.error("Ошибка парсинга кейсов из URL:", e);
        cases = [];
    }
}

// DOM элементы
const casesListEl = document.getElementById("cases-list");
const caseViewEl = document.getElementById("case-view");
const modalEl = document.getElementById("customModal");
const customTextEl = document.getElementById("customText");
let currentCaseId = null;

// Рендерим список кейсов
function renderCases() {
    casesListEl.innerHTML = "";

    if (cases.length === 0) {
        casesListEl.innerHTML = '<p>Пока нет активных кейсов</p>';
        return;
    }

    cases.forEach(c => {
        const div = document.createElement("div");
        div.className = "case";
        div.innerHTML = `
            <h2>📊 ${c.title}</h2>
            <p>${c.description}</p>
            <button class="primary" onclick="openCase(${c.id})">▶️ Участвовать</button>
        `;
        casesListEl.appendChild(div);
    });
}

// Открытие кейса
function openCase(caseId) {
    const c = cases.find(x => x.id === caseId);
    if (!c) return;

    currentCaseId = caseId;
    casesListEl.style.display = "none";
    caseViewEl.style.display = "block";

    caseViewEl.innerHTML = `<button class="back" onclick="backToCases()">← Назад</button>`;

    c.experts.forEach(e => {
        const btn = document.createElement("button");
        btn.className = "primary";
        btn.innerHTML = `${e.name}<br><small>${e.text}</small>`;
        btn.onclick = () => vote(caseId, e.id);
        caseViewEl.appendChild(btn);
    });

    const customBtn = document.createElement("button");
    customBtn.className = "custom";
    customBtn.textContent = "✍️ Свой прогноз (1 токен)";
    customBtn.onclick = () => customVote(caseId);
    caseViewEl.appendChild(customBtn);
}

function backToCases() {
    caseViewEl.style.display = "none";
    casesListEl.style.display = "block";
}

// Голос за эксперта
function vote(caseId, choice) {
    tg.sendData(JSON.stringify({
        case_id: caseId,
        choice: choice
    }));
    alert("✅ Ваш голос принят!\n\nВернитесь в чат, чтобы увидеть обновлённый баланс.");
}

// Свой прогноз
function customVote(caseId) {
    if (tokens <= 0) {
        alert("❌ Недостаточно токенов");
        return;
    }
    modalEl.style.display = "flex";
    customTextEl.value = "";
}

function closeModal() {
    modalEl.style.display = "none";
}

function submitCustom() {
    const text = customTextEl.value.trim();
    if (text.length < 3) {
        alert("⚠️ Прогноз слишком короткий (минимум 3 символа)");
        return;
    }

    const ok = confirm(`✍️ Свой прогноз стоит 1 токен\nПродолжить?`);
    if (!ok) return;

    tg.sendData(JSON.stringify({
        case_id: currentCaseId,
        choice: "custom",
        text: text
    }));

    closeModal();
    alert("✅ Прогноз отправлен!\n\nВернитесь в чат, чтобы увидеть обновлённый баланс.");
}

// Инициализация — сразу рендерим кейсы из параметра URL
renderCases();






