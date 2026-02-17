const tg = window.Telegram.WebApp;
tg.expand();

const API_URL = "https://neglectingly-colorful-griffin.ngrok-free.dev";
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : 0;

let userData = null;
let currentCorrectAnswer = null;

async function load() {
    try {
        const r = await fetch(`${API_URL}/get_user/${userId}`);
        const data = await r.json();
        if (data.error) throw new Error("User not found");
        userData = data;
        updateUI();
    } catch (e) {
        console.error("Сервер недоступен");
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

function startGame() {
    // Если данные не загрузились, пробуем загрузить еще раз и выходим
    if (!userData) {
        tg.showAlert("Сервер не отвечает. Проверь Python и ngrok!");
        load();
        return;
    }

    if (userData.energy < 5) {
        tg.showAlert("Энергия на нуле! Подожди восстановления.");
        return;
    }
    
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    // Генерация задачи (Юнит 1: Сравнение для новичков)
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    currentCorrectAnswer = Math.max(a, b);

    document.getElementById('quest-text').innerText = "Какое число больше?";
    document.getElementById('prob').innerText = `${a} vs ${b}`;

    const box = document.getElementById('ans-box');
    box.innerHTML = '';

    [a, b].forEach(val => {
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
        await fetch(`${API_URL}/update_score`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: userId, xp: 10, coins: 0.5 })
        });
        tg.showAlert("Верно! +0.5 $MATH");
    } else {
        tg.HapticFeedback.notificationOccurred('error');
        tg.showAlert(`Ошибка! Большее число: ${currentCorrectAnswer}`);
    }

    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    load();
}

load();
