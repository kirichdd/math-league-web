const tg = window.Telegram.WebApp;
tg.expand();

// ТВОЯ ССЫЛКА (Всегда проверяй, что она совпадает с той, что в терминале!)
const API_URL = "https://neglectingly-colorful-griffin.ngrok-free.dev";
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : 0;

let userData = null;
let currentCorrectAnswer = null;

// Функция для запросов с обходом предупреждения ngrok
async function apiFetch(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true' // ВОТ ОН, СЕКРЕТНЫЙ КЛЮЧ 🔑
    };
    return fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...options.headers } });
}

async function load() {
    try {
        const r = await apiFetch(`/get_user/${userId}`);
        userData = await r.json();
        updateUI();
    } catch (e) {
        console.error(e);
        document.getElementById('u-name').innerText = "Ошибка связи";
    }
}

function updateUI() {
    if (!userData) return;
    document.getElementById('u-name').innerText = userData.name || "Игрок";
    document.getElementById('coins').innerText = userData.coins.toFixed(1);
    document.getElementById('xp').innerText = userData.xp;
    document.getElementById('lvl').innerText = userData.lvl;
    document.getElementById('energy').innerText = userData.energy;
}

// ГЕНЕРАТОР В СТИЛЕ DUOLINGO (ЮНИТ 1)
function startGame() {
    if (!userData || userData.energy < 5) {
        tg.showAlert("Сервер не отвечает или мало энергии!");
        return;
    }
    
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    // Новая логика: если уровень 1 — только сравнение, если выше — сложение
    if (userData.lvl === 1) {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        currentCorrectAnswer = Math.max(a, b);
        document.getElementById('quest-text').innerText = "Кто больше?";
        document.getElementById('prob').innerText = `${a} vs ${b}`;
        renderButtons([a, b]);
    } else {
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        currentCorrectAnswer = a + b;
        document.getElementById('quest-text').innerText = "Сколько будет?";
        document.getElementById('prob').innerText = `${a} + ${b} = ?`;
        renderButtons([currentCorrectAnswer, currentCorrectAnswer + 1, currentCorrectAnswer - 1, currentCorrectAnswer + 2]);
    }
}

function renderButtons(opts) {
    const box = document.getElementById('ans-box');
    box.innerHTML = '';
    // Перемешиваем варианты
    opts.sort(() => Math.random() - 0.5).forEach(val => {
        const btn = document.createElement('button');
        btn.className = 'btn-ans';
        btn.innerText = val;
        btn.onclick = () => checkAnswer(val);
        box.appendChild(btn);
    });
}

async function checkAnswer(selected) {
    if (selected === currentCorrectAnswer) {
        tg.HapticFeedback.notificationOccurred('success');
        await apiFetch('/update_score', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, xp: 10, coins: 0.5 })
        });
        tg.showAlert("Верно! +0.5 $MATH");
    } else {
        tg.HapticFeedback.notificationOccurred('error');
        tg.showAlert("Неправильно!");
    }

    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    load();
}

load();
