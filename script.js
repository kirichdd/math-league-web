const tg = window.Telegram.WebApp;
tg.expand();

// ТВОЯ ССЫЛКА ИЗ NGROK (Проверь, чтобы она была актуальной!)
const API_URL = "https://neglectingly-colorful-griffin.ngrok-free.dev";
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : 0;

let userData = null;
let currentCorrectAnswer = null;

// 1. Загрузка данных
async function load() {
    try {
        const r = await fetch(`${API_URL}/get_user/${userId}`);
        userData = await r.json();
        updateUI();
    } catch (e) {
        console.error("Ошибка API. Проверь, запущен ли Python и ngrok!");
    }
}

function updateUI() {
    document.getElementById('u-name').innerText = userData.name || "Игрок";
    document.getElementById('coins').innerText = userData.coins.toFixed(1);
    document.getElementById('xp').innerText = userData.xp;
    document.getElementById('lvl').innerText = userData.lvl;
    document.getElementById('energy').innerText = userData.energy;
}

// 2. Генератор задач (как в Duolingo)
function generateTask(level) {
    let task = { text: "", prob: "", ans: 0, options: [] };

    if (level <= 2) {
        // ЮНИТ 1: Сравнение (Уровни 1-2)
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        if (a === b) return generateTask(level); // Чтобы не были равны
        task.text = "Какое число больше?";
        task.prob = `${a} vs ${b}`;
        task.ans = Math.max(a, b);
        task.options = [a, b];
    } 
    else if (level <= 5) {
        // ЮНИТ 2: Сложение до 20 (Уровни 3-5)
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        task.text = "Сколько будет?";
        task.prob = `${a} + ${b}`;
        task.ans = a + b;
        task.options = generateOptions(task.ans);
    } 
    else {
        // ЮНИТ 3: Вычитание (Уровни 6+)
        const a = Math.floor(Math.random() * 20) + 10;
        const b = Math.floor(Math.random() * 10) + 1;
        task.text = "Вычти числа:";
        task.prob = `${a} - ${b}`;
        task.ans = a - b;
        task.options = generateOptions(task.ans);
    }
    return task;
}

// Вспомогательная функция для генерации 4 вариантов ответа
function generateOptions(correct) {
    let opts = new Set([correct]);
    while (opts.size < 4) {
        let fake = correct + (Math.floor(Math.random() * 5) - 2);
        if (fake !== correct && fake >= 0) opts.add(fake);
        else opts.add(correct + opts.size + 1);
    }
    return Array.from(opts).sort(() => Math.random() - 0.5);
}

// 3. Логика игры
function startGame() {
    if (userData.energy < 5) {
        tg.showAlert("Энергия на нуле! Подожди восстановления.");
        return;
    }
    
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    const task = generateTask(userData.lvl);
    currentCorrectAnswer = task.ans;

    document.getElementById('quest-text').innerText = task.text;
    document.getElementById('prob').innerText = task.prob;

    const box = document.getElementById('ans-box');
    box.innerHTML = '';

    task.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn-ans';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt);
        box.appendChild(btn);
    });
}

async function checkAnswer(selected) {
    if (selected === currentCorrectAnswer) {
        tg.HapticFeedback.notificationOccurred('success');
        // Награда: 10 XP и 0.5 монет
        await fetch(`${API_URL}/update_score`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: userId, xp: 10, coins: 0.5 })
        });
        tg.showAlert("Правильно! +0.5 $MATH");
    } else {
        tg.HapticFeedback.notificationOccurred('error');
        tg.showAlert(`Ошибка! Правильный ответ: ${currentCorrectAnswer}`);
    }

    // Возврат на главный экран
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    load(); // Обновляем данные с сервера
}

// Запуск приложения
load();
