const tg = window.Telegram.WebApp;
tg.expand();

// ТВОЯ ССЫЛКА ИЗ NGROK
const API_URL = "https://neglectingly-colorful-griffin.ngrok-free.dev";
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : 0;

let userData = null;

// Загрузка данных пользователя
async function load() {
    try {
        const r = await fetch(`${API_URL}/get_user/${userId}`);
        userData = await r.json();
        updateUI();
    } catch (e) { console.error("API error"); }
}

function updateUI() {
    document.getElementById('u-name').innerText = userData.name;
    document.getElementById('coins').innerText = userData.coins.toFixed(1);
    document.getElementById('xp').innerText = userData.xp;
    document.getElementById('energy').innerText = userData.energy;
}

function startGame() {
    if (userData.energy < 5) return tg.showAlert("Нужно подождать восстановления энергии!");
    
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    nextQuestion();
}

function nextQuestion() {
    // Логика Юнита 1: Кто больше?
    const a = Math.floor(Math.random() * 20);
    const b = Math.floor(Math.random() * 20);
    const correct = Math.max(a, b);

    document.getElementById('quest-text').innerText = "Какое число больше?";
    document.getElementById('prob').innerText = `${a} vs ${b}`;

    const box = document.getElementById('ans-box');
    box.innerHTML = '';

    [a, b].forEach(val => {
        const btn = document.createElement('button');
        btn.className = 'btn-ans';
        btn.innerText = val;
        btn.onclick = () => check(val, correct);
        box.appendChild(btn);
    });
}

async function check(val, correct) {
    if (val === correct) {
        tg.HapticFeedback.notificationOccurred('success');
        // Отправляем результат на сервер
        await fetch(`${API_URL}/update_score`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: userId, xp: 10, coins: 0.2 })
        });
        tg.showAlert("Верно! +0.2 $MATH");
    } else {
        tg.HapticFeedback.notificationOccurred('error');
        tg.showAlert("Упс! Это было число " + correct);
    }
    
    // Возвращаемся на главный экран
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    load();
}

load();