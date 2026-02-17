const tg = window.Telegram.WebApp;
tg.expand();

// ПРОВЕРЬ ЭТУ ССЫЛКУ ЕЩЕ РАЗ!
const API_URL = "https://neglectingly-colorful-griffin.ngrok-free.dev";
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : 0;

let userData = null;

// Специальный запрос для обхода защиты ngrok
async function apiRequest(path) {
    return fetch(`${API_URL}${path}`, {
        headers: {
            'ngrok-skip-browser-warning': 'true', // Прячем предупреждение
            'Content-Type': 'application/json'
        }
    });
}

async function load() {
    try {
        console.log("Пытаюсь связаться с:", API_URL);
        const r = await apiRequest(`/get_user/${userId}`);
        
        if (!r.ok) throw new Error("Сервер вернул ошибку " + r.status);
        
        userData = await r.json();
        updateUI();
    } catch (e) {
        console.error(e);
        // Этот алерт скажет нам правду:
        tg.showAlert("Детали ошибки: " + e.message);
        document.getElementById('u-name').innerText = "Ошибка связи";
    }
}

function updateUI() {
    if (!userData) return;
    document.getElementById('u-name').innerText = userData.name || "DK";
    document.getElementById('coins').innerText = userData.coins.toFixed(1);
    document.getElementById('xp').innerText = userData.xp;
    document.getElementById('lvl').innerText = userData.lvl;
    document.getElementById('energy').innerText = userData.energy;
}

function startGame() {
    if (!userData) {
        load(); // Пробуем загрузить еще раз
        return;
    }
    // ... (остальной код игры) ...
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
}

load();
