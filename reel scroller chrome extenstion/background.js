// Track extension state
let scrollingEnabled = true;
let lastGesture = null;
let lastGestureTime = 0;
const DEBOUNCE_MS = 800;


chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('[GestureCam BG] External message from:', sender.url, message);

  // ── PING — health check from the detection page ──
  if (message.type === 'PING') {
    sendResponse({ status: 'ok', extensionVersion: '1.0.0' });
    return true;
  }

  // ── GESTURE — a hand gesture was detected ──
  if (message.type === 'GESTURE') {
    const { gesture } = message;

    // Debounce: ignore if same gesture sent too quickly
    const now = Date.now();
    if (gesture === lastGesture && now - lastGestureTime < DEBOUNCE_MS) {
      sendResponse({ status: 'debounced' });
      return true;
    }

    lastGesture = gesture;
    lastGestureTime = now;

    if (!scrollingEnabled) {
      sendResponse({ status: 'paused' });
      return true;
    }

    // Map gesture to scroll direction
    const scrollMap = {
      open_palm: 'down',  // Open palm = scroll to next reel
      fist:      'up',    // Fist = scroll to previous reel
    };

    const direction = scrollMap[gesture];
    if (!direction) {
      sendResponse({ status: 'unknown_gesture', gesture });
      return true;
    }

    // Send scroll command to the active Instagram tab
    sendScrollToInstagram(direction)
      .then(result => sendResponse({ status: 'ok', result }))
      .catch(err => sendResponse({ status: 'error', error: err.message }));

    return true; // Keep message channel open for async response
  }

  // ── TOGGLE — from popup to enable/disable scrolling ──
  if (message.type === 'TOGGLE_SCROLLING') {
    scrollingEnabled = message.enabled;
    console.log('[GestureCam BG] Scrolling', scrollingEnabled ? 'enabled' : 'disabled');
    sendResponse({ status: 'ok', scrollingEnabled });
    broadcastToPopup({ type: 'STATE_UPDATE', scrollingEnabled, lastGesture });
    return true;
  }

  // ── GET_STATE — popup asking for current state ──
  if (message.type === 'GET_STATE') {
    sendResponse({ scrollingEnabled, lastGesture });
    return true;
  }
});

// ── Listen for messages from POPUP or CONTENT SCRIPT ────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATE') {
    sendResponse({ scrollingEnabled, lastGesture });
    return true;
  }
  if (message.type === 'TOGGLE_SCROLLING') {
    scrollingEnabled = message.enabled;
    sendResponse({ status: 'ok', scrollingEnabled });
    return true;
  }
});


async function sendScrollToInstagram(direction) {
  // Find all Instagram tabs (Reels page preferred, then any IG page)
  const tabs = await chrome.tabs.query({
    url: ['https://www.instagram.com/reels/*', 'https://www.instagram.com/*'],
    active: false // Don't require the tab to be focused
  });

  if (tabs.length === 0) {
    console.warn('[GestureCam BG] No Instagram tab found');
    throw new Error('No Instagram tab found. Open instagram.com/reels first.');
  }

  // Prefer a Reels tab; fall back to any Instagram tab
  const reelsTab = tabs.find(t => t.url.includes('/reels/')) || tabs[0];

  console.log(`[GestureCam BG] Sending scroll "${direction}" to tab ${reelsTab.id}: ${reelsTab.url}`);

  // Try sending to content script first
  try {
    const response = await chrome.tabs.sendMessage(reelsTab.id, {
      type: 'SCROLL',
      direction
    });
    console.log('[GestureCam BG] Content script responded:', response);
    return response;
  } catch (err) {
    // Content script might not be injected yet — use scripting API as fallback
    console.warn('[GestureCam BG] Content script not ready, injecting...', err.message);
    await chrome.scripting.executeScript({
      target: { tabId: reelsTab.id },
      files: ['content.js']
    });
    // Retry
    const response = await chrome.tabs.sendMessage(reelsTab.id, {
      type: 'SCROLL',
      direction
    });
    return response;
  }
}


function broadcastToPopup(data) {
  chrome.runtime.sendMessage(data).catch(() => {
   
  });
}

console.log('[GestureCam BG] Service worker started ✓');
