const DETECTION_PAGE_URL = localStorage.getItem('gestureCam_detectUrl')
  || 'https://instagram-gesture-scroller.vercel.app/';  


document.addEventListener('DOMContentLoaded', async () => {
  // Show the extension's own ID
  const extId = chrome.runtime.id;
  const extIdEl = document.getElementById('ext-id-display');
  extIdEl.textContent = extId;
  extIdEl.onclick = () => {
    navigator.clipboard.writeText(extId).then(() => {
      extIdEl.textContent = 'Copied! ✓';
      extIdEl.style.color = '#00ff88';
      setTimeout(() => {
        extIdEl.textContent = extId;
        extIdEl.style.color = '';
      }, 1500);
    });
  };

  // Fetch state from background service worker
  try {
    const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
    updateUI(state);
  } catch (e) {
    console.warn('Could not get state from background:', e);
  }
});


function updateUI(state) {
  if (!state) return;

  const { scrollingEnabled, lastGesture } = state;

  // Status pill
  const pill = document.getElementById('status-pill');
  pill.textContent = scrollingEnabled ? '● ON' : '● OFF';
  pill.className = scrollingEnabled ? 'pill on' : 'pill';

  // Scrolling toggle button text
  document.getElementById('btn-toggle').textContent = scrollingEnabled ? 'Pause' : 'Resume';

  // Scrolling stat
  const scrollingEl = document.getElementById('popup-scrolling');
  scrollingEl.textContent = scrollingEnabled ? 'Enabled' : 'Paused';
  scrollingEl.className = scrollingEnabled ? 'stat-val green' : 'stat-val red';

  // Last gesture
  document.getElementById('popup-last-gesture').textContent = lastGesture || '—';

  // Gesture icon
  const iconMap = {
    open_palm: { icon: '✋', name: 'Open Palm', sub: 'Scrolling Down ↓' },
    fist:      { icon: '✊', name: 'Fist',       sub: 'Scrolling Up ↑' },
    peace:     { icon: '✌️', name: 'Peace',      sub: 'Toggling Pause' },
  };
  const g = iconMap[lastGesture] || { icon: '🤚', name: 'No Gesture', sub: 'Open the detection page to start' };
  document.getElementById('popup-gesture-icon').textContent = g.icon;
  document.getElementById('popup-gesture-name').textContent = g.name;
  document.getElementById('popup-gesture-sub').textContent  = g.sub;
}

// ── Toggle scrolling ─────────────────────────────────────────
document.getElementById('btn-toggle').addEventListener('click', async () => {
  try {
    const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
    const newEnabled = !state.scrollingEnabled;
    await chrome.runtime.sendMessage({ type: 'TOGGLE_SCROLLING', enabled: newEnabled });
    updateUI({ ...state, scrollingEnabled: newEnabled });
  } catch (e) {
    console.warn('Toggle error:', e);
  }
});

// ── Open Instagram Reels ────────────────────────────────────
document.getElementById('btn-ig').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.instagram.com/reels/' });
});

// ── Open detection page ─────────────────────────────────────
document.getElementById('btn-open-detect').addEventListener('click', () => {
  const url = DETECTION_PAGE_URL;
  chrome.tabs.create({ url : 'https://instagram-gesture-scroller.vercel.app/' });
});

// ── Listen for state updates from background ────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'STATE_UPDATE') {
    updateUI(message);
  }
});
