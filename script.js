const tg = window.Telegram.WebApp;
tg.expand();

const API_URL = "https://neglectingly-colorful-griffin.ngrok-free.dev";
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : 0;

let userData = null;
let currentCorrectAnswer = null;

async function apiFetch(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' };
    return fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...options.headers } });
}

async function load() {
    try {
        const r = await apiFetch(`/get_user/${userId}`);
        userData = await r.json();
        updateUI();
    } catch (e) {
        document.getElementById('u-name').innerText = "Ошибка связи";
    }
}

function safeSet(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

function updateUI() {
    if (!userData) return;
    safeSet('u-name', userData.name || "DK");
    safeSet('coins', userData.coins.toFixed(1));
    safeSet('xp', userData.xp);
    safeSet('lvl', userData.lvl);
    safeSet('energy', userData.energy);
}

function startGame() {
    if (!userData || userData.energy < 5) {
        tg.showAlert("Нет связи или мало энергии!");
        return;
    }
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    // Юнит 1: Сравнение
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    currentCorrectAnswer = Math.max(a, b);
    document.getElementById('quest-text').innerText = "Кто больше?";
    document.getElementById('prob').innerText = `${a} vs ${b}`;
    
    const box = document.getElementById('ans-box');
    box.innerHTML = '';
    [a, b].forEach(val => {
        const btn = document.createElement('button');
        btn.className = 'btn-ans'; btn.innerText = val;
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
        tg.showAlert("Верно!");
    } else {
        tg.HapticFeedback.notificationOccurred('error');
        tg.showAlert("Ошибка!");
    }
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    load();
}

load();
