(function () {
  if (window.__gestureCamV4) { console.log('[GestureCam] already loaded'); return; }
  window.__gestureCamV4 = true;
  console.log('[GestureCam] v4 loaded →', location.href);

  /* ── state ─────────────────────────────────────────────── */
  let busy     = false;
  let _cached  = null;   
  const COOL   = 950;   

  /* ── message listener ──────────────────────────────────── */
  chrome.runtime.onMessage.addListener((msg, _, respond) => {
    if (msg.type !== 'SCROLL') return;
    if (busy) { respond({ status:'busy' }); return true; }
    busy = true;

    const result = doScroll(msg.direction);
    toast(msg.direction, result);
    respond({ status:'ok', result });
    setTimeout(() => { busy = false; }, COOL);
    return true;
  });

  
  function doScroll(dir) {
    // 1 — direct scrollTop on the real Reels container
    const c = getReelsContainer();
    if (c) {
      const from = c.scrollTop;
      const step = c.clientHeight;
      const to   = dir === 'down' ? from + step : Math.max(0, from - step);
      smoothScroll(c, from, to, 380);
      console.log(`[GestureCam] ✓ Reels container scrollTop ${from|0} → ${to|0}  (clientH=${step|0})`);
      return 'reels_scrollTop';
    }

    // 2 — chevron buttons
    if (clickChevron(dir)) return 'chevron';

    // 3 — touch swipe
    touchSwipe(dir); return 'touch';
  }

 
  function getReelsContainer() {
    // Return cache if still valid
    if (_cached && document.contains(_cached) && _cached.scrollHeight > _cached.clientHeight + 50) {
      return _cached;
    }
    _cached = null;

    const minH = window.innerHeight * 0.55;
    const candidates = [];

    for (const el of document.querySelectorAll('div, section, main')) {
      const cs = getComputedStyle(el);
      const oy = cs.overflowY;
      if (oy !== 'scroll' && oy !== 'auto') continue;
      if (el.scrollHeight <= el.clientHeight + 50) continue;  // not scrollable
      if (el.clientHeight < minH) continue;                    // too small → skip tray/sidebar
      if (!el.querySelector('video')) continue;                // must contain video

      const snap = cs.scrollSnapType;
      const hasSnap = snap && snap !== 'none';
      candidates.push({ el, hasSnap, clientH: el.clientHeight });
    }

    if (!candidates.length) {
      console.warn('[GestureCam] no container found');
      return null;
    }

    // Prefer snap containers; among those pick tallest
    const snapped = candidates.filter(c => c.hasSnap);
    const pool    = snapped.length ? snapped : candidates;
    pool.sort((a, b) => b.clientH - a.clientH);

    _cached = pool[0].el;
    console.log('[GestureCam] container →',
      _cached.tagName,
      `clientH=${_cached.clientHeight}`,
      `scrollH=${_cached.scrollHeight}`,
      `snap=${getComputedStyle(_cached).scrollSnapType}`
    );
    return _cached;
  }

  /* ── rAF smooth scroll ─────────────────────────────────── */
  function smoothScroll(el, from, to, ms) {
    const t0 = performance.now();
    const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    const step = now => {
      const p = Math.min((now - t0) / ms, 1);
      el.scrollTop = from + (to - from) * ease(p);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ── chevron click ─────────────────────────────────────── */
  function clickChevron(dir) {
    const nxt = ['next','forward','suivant','siguiente','nächste'];
    const prv = ['prev','previous','back','précédent','anterior'];
    const kws = dir === 'down' ? nxt : prv;
    for (const btn of document.querySelectorAll('button,[role="button"]')) {
      const lbl = (btn.getAttribute('aria-label')||btn.getAttribute('title')||'').toLowerCase();
      if (kws.some(k => lbl.includes(k))) { btn.click(); return true; }
    }
    return false;
  }

  /* ── touch swipe ───────────────────────────────────────── */
  function touchSwipe(dir) {
    const vid = document.querySelector('video') || document.body;
    const r   = vid.getBoundingClientRect();
    const cx  = r.left + r.width  / 2;
    const cy  = r.top  + r.height / 2;
    const d   = window.innerHeight * 0.4;
    const sy  = dir === 'down' ? cy + d/2 : cy - d/2;
    const ey  = dir === 'down' ? cy - d/2 : cy + d/2;

    const mk = y => new Touch({ identifier: Date.now()+Math.random()*999|0, target:vid,
      clientX:cx, clientY:y, screenX:cx, screenY:y, pageX:cx, pageY:y,
      radiusX:12, radiusY:12, rotationAngle:0, force:1 });

    const fire = (type, y, active) => vid.dispatchEvent(new TouchEvent(type, {
      touches: active?[mk(y)]:[], targetTouches: active?[mk(y)]:[],
      changedTouches:[mk(y)], bubbles:true, cancelable:true }));

    fire('touchstart', sy, true);
    for (let i=1;i<=8;i++) fire('touchmove', sy+(ey-sy)*i/8, true);
    fire('touchend', ey, false);
  }

  /* ── toast ─────────────────────────────────────────────── */
  function toast(dir, method) {
    document.getElementById('gc-t')?.remove();
    if (!document.getElementById('gc-s')) {
      const s = document.createElement('style'); s.id='gc-s';
      s.textContent=`@keyframes gc{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`;
      document.head.appendChild(s);
    }
    const c = dir==='down'?'#00ff88':'#ff3c6f';
    const t = document.createElement('div'); t.id='gc-t';
    t.style.cssText=`position:fixed;bottom:78px;right:16px;z-index:2147483647;
      background:rgba(0,0,0,.92);color:${c};padding:9px 16px;border-radius:22px;
      font:700 12px/1 monospace;border:1.5px solid ${c};box-shadow:0 0 14px ${c}44;
      pointer-events:none;animation:gc .18s ease`;
    t.textContent=`${dir==='down'?'⬇ Next':'⬆ Prev'} Reel  ·  ${method}`;
    document.body.appendChild(t);
    setTimeout(()=>{ t.style.transition='opacity .3s'; t.style.opacity='0';
      setTimeout(()=>t.remove(),300); }, 1400);
  }

  /* ── SPA navigation: clear cache when Instagram loads a new reel ── */
  let _lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== _lastUrl) {
      _lastUrl = location.href; _cached = null;
      console.log('[GestureCam] URL changed, cache cleared');
    }
  }).observe(document.body, { childList:true, subtree:true });

  /* ── startup diagnostic ──────────────────────────────────── */
  setTimeout(() => {
    const c = getReelsContainer();
    console.log('[GestureCam] v4 ready —',
      c ? `container OK  scrollH=${c.scrollHeight} clientH=${c.clientHeight}` : 'NO CONTAINER (will retry on scroll)');
  }, 1800);

})();
