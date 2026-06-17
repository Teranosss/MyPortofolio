// ── BACKEND URL ──
// Development : http://localhost:8000/chat
// Production  : ganti dengan URL backend yang sudah deploy
const BACKEND_URL = '';

const messagesEl  = document.getElementById('chatMessages');
const welcomeEl   = document.getElementById('welcomeState');
const inputEl     = document.getElementById('userInput');
const sendBtn     = document.getElementById('sendBtn');
const newChatBtn  = document.getElementById('newChatBtn');
const mobileNew   = document.getElementById('mobileNewChatBtn');
const historyList = document.getElementById('chatHistoryList');

const mobileRecentBtn   = document.getElementById('mobileRecentBtn');
const mobileDrawer      = document.getElementById('mobileDrawer');
const drawerOverlay     = document.getElementById('drawerOverlay');
const drawerClose       = document.getElementById('drawerClose');
const drawerNewChatBtn  = document.getElementById('drawerNewChatBtn');
const drawerHistoryList = document.getElementById('drawerHistoryList');

// Mobile back button
const backBtn = document.querySelector('.btn-mobile-back');
function updateBackBtn() {
  if (backBtn) backBtn.style.display = window.innerWidth <= 640 ? 'flex' : 'none';
}
updateBackBtn();
window.addEventListener('resize', updateBackBtn);

// Drawer
function openDrawer() {
  if (window.innerWidth > 640) return;
  mobileDrawer.style.display = 'flex';
  drawerOverlay.style.display = 'block';
  setTimeout(() => { mobileDrawer.classList.add('open'); drawerOverlay.classList.add('open'); }, 10);
}
function closeDrawer() {
  mobileDrawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
  setTimeout(() => { mobileDrawer.style.display = 'none'; drawerOverlay.style.display = 'none'; }, 300);
}
if (mobileRecentBtn)  mobileRecentBtn.addEventListener('click', openDrawer);
if (drawerClose)      drawerClose.addEventListener('click', closeDrawer);
if (drawerOverlay)    drawerOverlay.addEventListener('click', closeDrawer);
if (drawerNewChatBtn) drawerNewChatBtn.addEventListener('click', () => { newChat(); closeDrawer(); });

let history = [];
let sessions = [];
let currentId = null;

// Textarea auto-resize
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + 'px';
  sendBtn.classList.toggle('ready', inputEl.value.trim().length > 0);
});
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
sendBtn.addEventListener('click', sendMessage);
newChatBtn.addEventListener('click', newChat);
mobileNew.addEventListener('click', newChat);

function useChip(el) {
  inputEl.value = el.textContent;
  inputEl.dispatchEvent(new Event('input'));
  sendMessage();
}

// Make useChip globally accessible since it is called inline in HTML
window.useChip = useChip;

function newChat() {
  if (history.length > 0) saveSession();
  history = [];
  currentId = null;
  messagesEl.innerHTML = '';
  messagesEl.appendChild(welcomeEl);
  welcomeEl.style.display = 'flex';
  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendBtn.classList.remove('ready');
}

function saveSession() {
  const firstUser = history.find(h => h.role === 'user');
  const title = firstUser?.content?.slice(0, 40) || 'New Chat';
  if (currentId) {
    const s = sessions.find(s => s.id === currentId);
    if (s) { s.history = [...history]; s.title = title; }
  } else {
    currentId = Date.now();
    sessions.unshift({ id: currentId, title, history: [...history] });
  }
  renderHistory();
}

function renderHistory() {
  [historyList, drawerHistoryList].forEach(list => {
    if (!list) return;
    list.innerHTML = '';
    sessions.forEach(s => {
      const d = document.createElement('div');
      d.className = 'chat-history-item' + (s.id === currentId ? ' active' : '');
      d.textContent = s.title;
      d.onclick = () => { loadSession(s.id); closeDrawer(); };
      list.appendChild(d);
    });
  });
}

function loadSession(id) {
  const s = sessions.find(s => s.id === id);
  if (!s) return;
  currentId = id;
  history = [...s.history];
  welcomeEl.style.display = 'none';
  messagesEl.innerHTML = '';
  history.forEach(h => appendMessage(h.role === 'user' ? 'user' : 'bot', h.content, false));
  renderHistory();
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  welcomeEl.style.display = 'none';
  appendMessage('user', text);
  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendBtn.classList.remove('ready');
  history.push({ role: 'user', content: text });

  const typingId = appendTyping();

  try {
    if (!BACKEND_URL) {
      removeTyping(typingId);
      appendMessage('bot', '⚠️ AI backend belum dikonfigurasi. Silakan hubungi pemilik website.');
      history.pop();
      return;
    }
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    removeTyping(typingId);

    const reply = data?.reply || null;

    if (reply) {
      appendMessage('bot', reply);
      history.push({ role: 'bot', content: reply });
      saveSession();
    } else {
      appendMessage('bot', '⚠️ Tidak ada respons dari AI. Cek backend dan Langflow flow.');
      console.warn('Backend response:', data);
      history.pop();
    }

  } catch (err) {
    removeTyping(typingId);
    appendMessage('bot', `⚠️ Gagal terhubung ke AI.\n\n${err.message}`);
    history.pop();
    console.error('Fetch error:', err);
  }
}

function appendMessage(role, text, scroll = true) {
  const msg = document.createElement('div');
  msg.className = `msg ${role}`;
  msg.innerHTML = `
    <div class="msg-avatar">${role === 'user' ? 'U' : '✦'}</div>
    <div class="msg-bubble">${formatText(text)}</div>
  `;
  messagesEl.appendChild(msg);
  if (scroll) messagesEl.scrollTop = messagesEl.scrollHeight;
  return msg;
}

function appendTyping() {
  const id = 'typing-' + Date.now();
  const msg = document.createElement('div');
  msg.className = 'msg bot'; msg.id = id;
  msg.innerHTML = `<div class="msg-avatar">✦</div><div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function formatText(text) {
  return text
    .replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(0,240,255,0.06);border:1px solid rgba(0,240,255,0.15);border-radius:8px;padding:0.75rem;overflow-x:auto;font-size:0.82rem;margin:0.4rem 0;"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(0,240,255,0.08);padding:0.1em 0.4em;border-radius:4px;font-size:0.85em;">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

const textarea = document.querySelector(".ai-textarea");
textarea.addEventListener("input", () => {
  textarea.style.height ="auto"
  textarea.style.height = textarea.scrollHeight + "px";
});

// ── LIGHT/DARK MODE TOGGLE LOGIC ──
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeToggleBtnMobile = document.getElementById('themeToggleBtnMobile');

function updateThemeIcons(theme) {
  [themeToggleBtn, themeToggleBtnMobile].forEach(btn => {
    if (!btn) return;
    const sunIcon = btn.querySelector('.sun-icon');
    const moonIcon = btn.querySelector('.moon-icon');
    if (theme === 'light') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  });
}

// Initial update
const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
updateThemeIcons(currentTheme);

// Toggle theme function
function toggleTheme() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const newTheme = isLight ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcons(newTheme);
}

if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
if (themeToggleBtnMobile) themeToggleBtnMobile.addEventListener('click', toggleTheme);

