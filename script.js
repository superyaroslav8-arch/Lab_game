// ===== Данные =====
const YANDEX_GAMES = [
  { id: 1, title: "Танчики", desc: "Классическая игра про танки", category: "action", icon: "🛡️", isUser: false },
  { id: 2, title: "Судоку", desc: "Японская головоломка с цифрами", category: "puzzle", icon: "🔢", isUser: false },
  { id: 3, title: "Змейка", desc: "Классическая змейка", category: "arcade", icon: "🐍", isUser: false },
  { id: 4, title: "Шахматы", desc: "Играй в шахматы онлайн", category: "strategy", icon: "♟️", isUser: false },
  { id: 5, title: "2048", desc: "Собери плитку 2048", category: "puzzle", icon: "🧩", isUser: false },
  { id: 6, title: "Тетрис", desc: "Классический тетрис", category: "arcade", icon: "🟦", isUser: false },
  { id: 7, title: "Марио", desc: "Прыгай и собирай монеты", category: "action", icon: "🍄", isUser: false },
  { id: 8, title: "Пасьянс", desc: "Классический пасьянс Косынка", category: "puzzle", icon: "🃏", isUser: false },
  { id: 9, title: "Гонки", desc: "Быстрые гонки по трассе", category: "action", icon: "🏎️", isUser: false },
  { id: 10, title: "Морской бой", desc: "Потопи флот противника", category: "strategy", icon: "🚢", isUser: false },
  { id: 11, title: "Сапер", desc: "Найди все мины", category: "puzzle", icon: "💣", isUser: false },
  { id: 12, title: "Арканоид", desc: "Разбей все блоки", category: "arcade", icon: "🧱", isUser: false },
];

const BLOCK_NAMES = {
  player: "Игрок",
  enemy: "Враг",
  platform: "Платформа",
  coin: "Монета",
  obstacle: "Препятствие",
  finish: "Финиш"
};

// ===== Состояние =====
let currentUser = null;
let userGames = [];
let selectedBlocks = [];
let isRegisterMode = false;

// ===== Инициализация =====
document.addEventListener('DOMContentLoaded', () => {
  loadUser();
  loadUserGames();
  loadTheme();
  renderCatalog();
  setupEventListeners();
  updateUI();
});

function loadUser() {
  const saved = localStorage.getItem('lab_user');
  if (saved) currentUser = JSON.parse(saved);
}

function loadUserGames() {
  const saved = localStorage.getItem('lab_user_games');
  if (saved) userGames = JSON.parse(saved);
}

function saveUserGames() {
  localStorage.setItem('lab_user_games', JSON.stringify(userGames));
}

function loadTheme() {
  const theme = localStorage.getItem('lab_theme') || 'light';
  document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ===== Навигация =====
function setupEventListeners() {
  // Навигация
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(el.dataset.page);
    });
  });

  // Тема
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Авторизация
  document.getElementById('login-btn').addEventListener('click', () => openAuthModal(false));
  document.getElementById('register-btn').addEventListener('click', () => openAuthModal(true));
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('auth-form').addEventListener('submit', handleAuth);
  document.getElementById('switch-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    updateAuthModal();
  });

  // Модалки
  document.querySelectorAll('.close-modal').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById('auth-modal').classList.remove('open');
      document.getElementById('game-modal').classList.remove('open');
    });
  });

  // Поиск и фильтр
  document.getElementById('search-games').addEventListener('input', renderCatalog);
  document.getElementById('category-filter').addEventListener('change', renderCatalog);

  // Вкладки создания
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  // ИИ генерация
  document.getElementById('generate-ai-btn').addEventListener('click', generateAIGame);

  // Ручное создание
  document.querySelectorAll('.block-btn').forEach(btn => {
    btn.addEventListener('click', () => addBlock(btn.dataset.block));
  });
  document.getElementById('create-manual-btn').addEventListener('click', createManualGame);
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  
  const link = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (link) link.classList.add('active');

  if (pageId === 'my-games') renderMyGames();
  if (pageId === 'catalog') renderCatalog();
}

// ===== Тема =====
function toggleTheme() {
  const isDark = document.body.classList.contains('dark-theme');
  document.body.className = isDark ? 'light-theme' : 'dark-theme';
  document.getElementById('theme-toggle').textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('lab_theme', isDark ? 'light' : 'dark');
}

// ===== Авторизация =====
function openAuthModal(register) {
  isRegisterMode = register;
  updateAuthModal();
  document.getElementById('auth-modal').classList.add('open');
}

function updateAuthModal() {
  document.getElementById('auth-title').textContent = isRegisterMode ? 'Регистрация' : 'Вход';
  document.getElementById('auth-submit').textContent = isRegisterMode ? 'Зарегистрироваться' : 'Войти';
  document.getElementById('switch-to-register').textContent = isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться';
  document.getElementById('auth-username').value = '';
  document.getElementById('auth-password').value = '';
}

function handleAuth(e) {
  e.preventDefault();
  const username = document.getElementById('auth-username').value.trim();
  const password = document.getElementById('auth-password').value;

  if (!username || !password) return alert('Заполните все поля');

  if (isRegisterMode) {
    // Регистрация
    const users = JSON.parse(localStorage.getItem('lab_users') || '{}');
    if (users[username]) return alert('Пользователь уже существует');
    users[username] = { password, created: Date.now() };
    localStorage.setItem('lab_users', JSON.stringify(users));
    currentUser = { username };
    localStorage.setItem('lab_user', JSON.stringify(currentUser));
    alert('Регистрация успешна! Добро пожаловать, ' + username);
  } else {
    // Вход
    const users = JSON.parse(localStorage.getItem('lab_users') || '{}');
    if (!users[username] || users[username].password !== password) {
      return alert('Неверный логин или пароль');
    }
    currentUser = { username };
    localStorage.setItem('lab_user', JSON.stringify(currentUser));
  }

  document.getElementById('auth-modal').classList.remove('open');
  updateUI();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('lab_user');
  updateUI();
  showPage('home');
}

function updateUI() {
  const authBtns = document.getElementById('auth-buttons');
  const userInfo = document.getElementById('user-info');
  const createLink = document.getElementById('create-link');
  const myGamesLink = document.getElementById('my-games-link');
  const heroCreate = document.getElementById('hero-create');

  if (currentUser) {
    authBtns.style.display = 'none';
    userInfo.style.display = 'flex';
    userInfo.style.alignItems = 'center';
    userInfo.style.gap = '12px';
    document.getElementById('username-display').textContent = currentUser.username;
    createLink.style.display = 'inline-block';
    myGamesLink.style.display = 'inline-block';
    heroCreate.style.display = 'inline-block';
  } else {
    authBtns.style.display = 'flex';
    authBtns.style.gap = '8px';
    userInfo.style.display = 'none';
    createLink.style.display = 'none';
    myGamesLink.style.display = 'none';
    heroCreate.style.display = 'none';
  }
}

// ===== Каталог =====
function renderCatalog() {
  const search = document.getElementById('search-games').value.toLowerCase();
  const category = document.getElementById('category-filter').value;

  let games = [...YANDEX_GAMES, ...userGames.filter(g => g.published)];

  if (search) {
    games = games.filter(g => g.title.toLowerCase().includes(search) || g.desc.toLowerCase().includes(search));
  }
  if (category !== 'all') {
    if (category === 'user') {
      games = games.filter(g => g.isUser);
    } else {
      games = games.filter(g => g.category === category);
    }
  }

  const grid = document.getElementById('games-grid');
  if (games.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary)">Игры не найдены</p>';
    return;
  }

  grid.innerHTML = games.map(g => `
    <div class="game-card" onclick="openGame(${g.id}, ${g.isUser || false})">
      <div class="game-thumb">${g.icon || '🎮'}</div>
      <div class="game-info">
        <h3>${g.title}</h3>
        <p>${g.desc}</p>
        <span class="game-tag ${g.isUser ? 'user' : ''}">${g.isUser ? 'Пользовательская' : g.category}</span>
      </div>
    </div>
  `).join('');
}

function openGame(id, isUser) {
  let game;
  if (isUser) {
    game = userGames.find(g => g.id === id);
  } else {
    game = YANDEX_GAMES.find(g => g.id === id);
  }
  if (!game) return;

  document.getElementById('game-modal-title').textContent = game.title;
  document.getElementById('game-desc').textContent = game.desc + (game.blocks ? '\n\nБлоки: ' + game.blocks.join(', ') : '');
  document.getElementById('game-modal').classList.add('open');
}

// ===== Создание с ИИ =====
function generateAIGame() {
  if (!currentUser) return alert('Сначала войдите в аккаунт');

  const prompt = document.getElementById('ai-prompt').value.trim();
  const title = document.getElementById('ai-title').value.trim();

  if (!prompt || !title) return alert('Заполните описание и название');

  const btn = document.getElementById('generate-ai-btn');
  btn.textContent = 'Генерация...';
  btn.disabled = true;

  // Имитация ИИ (в реальном проекте здесь был бы запрос к API)
  setTimeout(() => {
    const icons = ['🎮', '🚀', '🐉', '⚔️', '🏰', '🌟', '🔥', '💎'];
    const categories = ['action', 'puzzle', 'arcade', 'strategy'];
    const newGame = {
      id: Date.now(),
      title,
      desc: 'Сгенерировано ИИ по описанию: ' + prompt.slice(0, 80) + (prompt.length > 80 ? '...' : ''),
      category: categories[Math.floor(Math.random() * categories.length)],
      icon: icons[Math.floor(Math.random() * icons.length)],
      isUser: true,
      author: currentUser.username,
      published: true,
      createdAt: Date.now(),
      aiGenerated: true
    };

    userGames.push(newGame);
    saveUserGames();

    const result = document.getElementById('ai-result');
    result.style.display = 'block';
    result.className = 'result-box success';
    result.innerHTML = `
      <h3>✅ Игра создана!</h3>
      <p><strong>${newGame.title}</strong></p>
      <p>${newGame.desc}</p>
      <p>Игра автоматически опубликована в каталоге.</p>
      <button class="btn btn-primary" style="margin-top:12px" onclick="showPage('my-games')">Перейти к моим играм</button>
    `;

    btn.textContent = 'Сгенерировать игру с ИИ';
    btn.disabled = false;
    document.getElementById('ai-prompt').value = '';
    document.getElementById('ai-title').value = '';
  }, 1500);
}

// ===== Ручное создание =====
function addBlock(type) {
  selectedBlocks.push(type);
  renderSelectedBlocks();
}

function removeBlock(index) {
  selectedBlocks.splice(index, 1);
  renderSelectedBlocks();
}

function renderSelectedBlocks() {
  const container = document.getElementById('selected-blocks');
  if (selectedBlocks.length === 0) {
    container.innerHTML = '<span style="color:var(--text-secondary);font-size:0.9rem">Выберите блоки выше</span>';
    return;
  }
  container.innerHTML = selectedBlocks.map((b, i) => `
    <span class="selected-block">
      ${BLOCK_NAMES[b] || b}
      <button onclick="removeBlock(${i})">&times;</button>
    </span>
  `).join('');
}

function createManualGame() {
  if (!currentUser) return alert('Сначала войдите в аккаунт');

  const title = document.getElementById('manual-title').value.trim();
  const desc = document.getElementById('manual-desc').value.trim();
  const category = document.getElementById('manual-category').value;

  if (!title) return alert('Введите название');
  if (selectedBlocks.length === 0) return alert('Добавьте хотя бы один блок');

  const icons = { action: '⚔️', puzzle: '🧩', arcade: '👾', strategy: '♟️' };
  const newGame = {
    id: Date.now(),
    title,
    desc: desc || 'Игра собрана вручную из блоков',
    category,
    icon: icons[category] || '🎮',
    isUser: true,
    author: currentUser.username,
    published: true,
    createdAt: Date.now(),
    blocks: selectedBlocks.map(b => BLOCK_NAMES[b] || b),
    aiGenerated: false
  };

  userGames.push(newGame);
  saveUserGames();

  const result = document.getElementById('manual-result');
  result.style.display = 'block';
  result.className = 'result-box success';
  result.innerHTML = `
    <h3>✅ Игра создана!</h3>
    <p><strong>${newGame.title}</strong></p>
    <p>Блоки: ${newGame.blocks.join(', ')}</p>
    <p>Игра опубликована в каталоге.</p>
    <button class="btn btn-primary" style="margin-top:12px" onclick="showPage('my-games')">Перейти к моим играм</button>
  `;

  document.getElementById('manual-title').value = '';
  document.getElementById('manual-desc').value = '';
  selectedBlocks = [];
  renderSelectedBlocks();
}

// ===== Мои игры =====
function renderMyGames() {
  const list = document.getElementById('my-games-list');
  const my = userGames.filter(g => g.author === currentUser?.username);

  if (my.length === 0) {
    list.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary)">Вы ещё не создали ни одной игры. Перейдите в раздел «Создать игру»!</p>';
    return;
  }

  list.innerHTML = my.map(g => `
    <div class="game-card" onclick="openGame(${g.id}, true)">
      <div class="game-thumb">${g.icon || '🎮'}</div>
      <div class="game-info">
        <h3>${g.title}</h3>
        <p>${g.desc}</p>
        <span class="game-tag user">${g.aiGenerated ? 'ИИ' : 'Вручную'}</span>
      </div>
    </div>
  `).join('');
}

// Глобальные функции для onclick
window.openGame = openGame;
window.removeBlock = removeBlock;
window.showPage = showPage;
