/**
 * Coach Management System (CMS) — GA Edition
 * Universal Suite Navigation, Pitch-Side Resilience Pill & Ergonomics HUD
 */
(function(window, document) {
  'use strict';

  const TOOLS = [
    { id: 'squad', name: 'Squad & Club Dashboard', icon: '🏟️', url: 'index.html', desc: 'Squad roster, team setup, analytics & staff' },
    { id: 'session', name: 'Session Planner Studio', icon: '📋', url: 'session-planner.html', desc: 'Tactical drills, training calendar & session designer' },
    { id: 'analyzer', name: 'Tactical Video Analyzer', icon: '📹', url: 'video-analyzer.html', desc: 'Telestration, multi-layer drawing & video breakdown' },
    { id: 'clipper', name: 'Match Video Clipper', icon: '✂️', url: 'video-clipper.html', desc: 'Rapid video clipping, trimming & reel generation' },
    { id: 'tracker', name: 'Player Tracking System', icon: '🎯', url: 'player-tracker-lab.html', desc: 'Tactical vision, radar tracking, 2D/3D pitch mapping' },
    { id: 'report', name: 'Match Report Studio', icon: '📋', url: 'match-report.html', desc: 'AI-assisted match reports, scouting notes & line-ups' },
    { id: 'formation', name: 'Formation Visualizer', icon: '🧩', url: 'formation-builder.html', desc: 'Tactical lineup builder, formations & player cards' },
    { id: 'notes', name: 'Pitchside Match Notes', icon: '📱', url: 'notes.html', desc: 'iPhone/mobile rapid live match timeline & notes' }
  ];

  function getCurrentTool() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('session-planner')) return 'session';
    if (path.includes('video-analyzer')) return 'analyzer';
    if (path.includes('video-clipper')) return 'clipper';
    if (path.includes('player-tracker')) return 'tracker';
    if (path.includes('match-report')) return 'report';
    if (path.includes('formation-builder')) return 'formation';
    if (path.includes('notes.html')) return 'notes';
    return 'squad';
  }

  function getClubBranding() {
    try {
      const b = localStorage.getItem('fhq_branding');
      if (b) {
        const parsed = JSON.parse(b);
        return {
          name: parsed.name || 'Coach Management System',
          logo: parsed.logo || ''
        };
      }
    } catch (e) {}
    return { name: 'Coach Management System', logo: '' };
  }

  let syncDrawerOpen = false;

  const CMSNav = {
    currentToolId: getCurrentTool(),

    renderHeaderHtml: function() {
      const current = this.currentToolId;
      const branding = getClubBranding();
      const currentToolObj = TOOLS.find(t => t.id === current) || TOOLS[0];
      const isOnline = navigator.onLine;

      const navLinksHtml = TOOLS.map(t => {
        const isActive = t.id === current;
        return `
          <a href="${t.url}" class="cms-nav-link ${isActive ? 'active' : ''}" title="${t.desc}">
            <span>${t.icon}</span>
            <span>${t.name}</span>
          </a>
        `;
      }).join('');

      return `
        <header class="cms-suite-topbar" id="cms-universal-topbar">
          <div class="cms-nav-left">
            <a href="index.html" class="cms-nav-brand" title="Return to Core Dashboard">
              <div class="cms-nav-logo-badge">⚽</div>
              <div class="cms-nav-brand-text">
                <span class="cms-nav-brand-title">${branding.name}</span>
                <span class="cms-nav-brand-sub">CMS Pro Suite</span>
              </div>
            </a>
            <div class="cms-nav-divider"></div>
            <div class="cms-nav-active-tool-pill">
              <span class="cms-nav-active-dot"></span>
              <span>${currentToolObj.name}</span>
            </div>
          </div>

          <nav class="cms-nav-center">
            ${navLinksHtml}
          </nav>

          <div class="cms-nav-right">
            <!-- Connection & Offline Resilience Pill -->
            <div class="cms-nav-sync-pill" id="cms-nav-sync-pill" onclick="CMSNav.toggleSyncDrawer()" title="Pitchside & Cloud Sync Status (Click to inspect)">
              <span class="cms-sync-dot ${isOnline ? 'online' : 'offline'}" id="cms-sync-dot"></span>
              <span class="cms-sync-label" id="cms-sync-label">${isOnline ? 'Live Sync' : 'Saved Locally (Offline)'}</span>
            </div>

            <!-- Quick Command Palette Switcher -->
            <button type="button" class="cms-nav-cmd-btn" onclick="CMSNav.openCommandPalette()" title="Quick Switcher (Press Ctrl+K or Cmd+K)">
              <span>⚡ Switcher</span>
              <span class="cms-nav-kbd">⌘K</span>
            </button>

            ${current !== 'squad' ? `
              <a href="index.html" class="cms-nav-action-btn" title="Back to Squad Dashboard">
                <span>← Dashboard</span>
              </a>
            ` : ''}

            <!-- Sync Drawer Dropdown -->
            <div class="cms-nav-sync-drawer" id="cms-sync-drawer" style="display:none;">
              <div class="cms-sync-drawer-row">
                <span style="font-weight:700;color:#ffffff;display:flex;align-items:center;gap:6px;">
                  <span id="cms-drawer-status-dot" class="cms-sync-dot ${isOnline ? 'online' : 'offline'}"></span>
                  <span id="cms-drawer-status-text">${isOnline ? 'Online (Connected)' : 'Offline (Pitchside Mode)'}</span>
                </span>
                <span id="cms-drawer-pending-badge" style="font-family:var(--cms-font-mono);font-size:11px;color:var(--cms-text-secondary);">0 pending</span>
              </div>
              
              <div style="font-size:11.5px;color:var(--cms-text-secondary);line-height:1.4;">
                All squad edits, session notes, and match ratings are optimistically saved locally on your device and automatically synced to the cloud upon reconnection.
              </div>

              <div class="cms-sync-drawer-row" style="border-top:1px solid var(--cms-border-subtle);padding-top:10px;">
                <span style="font-size:12px;font-weight:600;">Outdoor Sun Glare Mode:</span>
                <button type="button" class="cms-pitch-mode-btn" onclick="CMSNav.togglePitchMode()" style="padding:4px 10px;border-radius:6px;background:rgba(255,255,255,0.08);border:1px solid var(--cms-border-medium);color:#fff;font-size:11.5px;font-weight:700;cursor:pointer;">
                  ☀️ Sunlight Turf
                </button>
              </div>

              <button type="button" class="cms-sync-drawer-btn" onclick="CMSNav.forceSyncNow()">
                <span>⚡ Force Cloud Sync</span>
              </button>
            </div>
          </div>
        </header>
      `;
    },

    updateSyncPill: function(status, count = 0) {
      const dot = document.getElementById('cms-sync-dot');
      const label = document.getElementById('cms-sync-label');
      const drawerDot = document.getElementById('cms-drawer-status-dot');
      const drawerText = document.getElementById('cms-drawer-status-text');
      const drawerPending = document.getElementById('cms-drawer-pending-badge');

      if (!dot || !label) return;

      dot.className = 'cms-sync-dot ' + status;
      if (drawerDot) drawerDot.className = 'cms-sync-dot ' + status;

      let labelText = 'Live Sync';
      let descText = 'Online (Connected)';

      if (status === 'offline') {
        labelText = count > 0 ? `Saved Offline (${count})` : 'Saved Locally (Offline)';
        descText = 'Offline (Pitchside Mode)';
      } else if (status === 'syncing') {
        labelText = 'Syncing...';
        descText = 'Flushing changes to cloud...';
      } else if (status === 'error') {
        labelText = 'Network Error';
        descText = 'Temporary network disconnect';
      }

      label.textContent = labelText;
      if (drawerText) drawerText.textContent = descText;
      if (drawerPending) drawerPending.textContent = `${count} pending`;
    },

    toggleSyncDrawer: function() {
      const drawer = document.getElementById('cms-sync-drawer');
      if (!drawer) return;
      syncDrawerOpen = !syncDrawerOpen;
      drawer.style.display = syncDrawerOpen ? 'flex' : 'none';
    },

    togglePitchMode: function() {
      if (window.CMSStorage && typeof window.CMSStorage.togglePitchMode === 'function') {
        const next = window.CMSStorage.togglePitchMode();
        if (window.CMSBus) {
          window.CMSBus.notify(next === 'sunlight' ? 'High-Contrast Sunlight Turf Enabled ☀️' : 'Midnight Tactical Mode Enabled 🌙');
        }
      }
    },

    forceSyncNow: function() {
      if (window.CMSStorage && typeof window.CMSStorage.flushOfflineQueue === 'function') {
        const db = window.db || null;
        window.CMSStorage.flushOfflineQueue(db);
        this.updateSyncPill('syncing', 0);
      }
    },

    /**
     * Mount floating Undo/Redo & Ergonomic gesture HUD directly onto canvas container
     * @param {string|HTMLElement} targetContainer
     * @param {object} options - { onUndo, onRedo, getStepCount, onToggleMode, canvas }
     */
    initCanvasHUD: function(targetContainer, options = {}) {
      const container = typeof targetContainer === 'string' ? document.getElementById(targetContainer) : targetContainer;
      if (!container) return;

      let hud = container.querySelector('.cms-canvas-hud');
      if (!hud) {
        hud = document.createElement('div');
        hud.className = 'cms-canvas-hud';
        container.style.position = 'relative';
        container.appendChild(hud);
      }

      hud.innerHTML = `
        <button type="button" class="cms-hud-btn" id="cms-hud-undo-btn" title="Undo (Ctrl+Z)">
          <span>↩️</span><span style="font-size:11px;">Undo</span>
        </button>
        <div class="cms-hud-counter" id="cms-hud-step-counter">0</div>
        <button type="button" class="cms-hud-btn" id="cms-hud-redo-btn" title="Redo (Ctrl+Y)">
          <span>↪️</span><span style="font-size:11px;">Redo</span>
        </button>
        <div class="cms-hud-sep"></div>
        <button type="button" class="cms-hud-btn" id="cms-hud-sunlight-btn" title="Toggle Sunlight Turf Mode">
          <span>☀️</span>
        </button>
      `;

      const undoBtn = hud.querySelector('#cms-hud-undo-btn');
      const redoBtn = hud.querySelector('#cms-hud-redo-btn');
      const sunlightBtn = hud.querySelector('#cms-hud-sunlight-btn');

      if (undoBtn && options.onUndo) undoBtn.onclick = (e) => { e.stopPropagation(); options.onUndo(); };
      if (redoBtn && options.onRedo) redoBtn.onclick = (e) => { e.stopPropagation(); options.onRedo(); };
      if (sunlightBtn) {
        sunlightBtn.onclick = (e) => {
          e.stopPropagation();
          if (options.onToggleMode) options.onToggleMode();
          else this.togglePitchMode();
        };
      }

      // Update step count periodically or on change
      if (options.getStepCount) {
        const updateStep = () => {
          const counter = hud.querySelector('#cms-hud-step-counter');
          if (counter) counter.textContent = String(options.getStepCount() || 0);
        };
        updateStep();
        setInterval(updateStep, 500);
      }

      // Touch & Palm Rejection Ergonomics on targeted canvas
      const targetCanvas = options.canvas || container.querySelector('canvas') || container;
      if (targetCanvas && !targetCanvas._cmsPalmGuardAttached) {
        targetCanvas._cmsPalmGuardAttached = true;
        targetCanvas.style.touchAction = 'none';

        // Filter out palm rests (width/height > 35px or multi-finger palm contacts)
        targetCanvas.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'touch' && (e.width > 35 || e.height > 35)) {
            // Palm detected: discard event to prevent accidental stray markings
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        }, { capture: true, passive: false });
      }
    },

    renderCommandPaletteHtml: function() {
      const current = this.currentToolId;
      const itemsHtml = TOOLS.map((t, idx) => {
        const isCurrent = t.id === current;
        return `
          <div class="cms-cmd-item ${idx === 0 ? 'selected' : ''}" data-url="${t.url}" onclick="window.location.href='${t.url}'">
            <div class="cms-cmd-item-left">
              <span class="cms-cmd-item-icon">${t.icon}</span>
              <div>
                <div style="font-weight:700;">${t.name} ${isCurrent ? '<span style="color:var(--cms-accent-green);font-size:10px;margin-left:6px;">(Current)</span>' : ''}</div>
                <div style="font-size:11px;color:var(--cms-text-tertiary);">${t.desc}</div>
              </div>
            </div>
            <span class="cms-cmd-item-shortcut">Jump ↵</span>
          </div>
        `;
      }).join('');

      return `
        <div class="cms-cmd-backdrop" id="cms-cmd-backdrop" onclick="if(event.target===this) CMSNav.closeCommandPalette()">
          <div class="cms-cmd-card" role="dialog" aria-modal="true">
            <div class="cms-cmd-search-wrap">
              <span style="font-size:18px;">🔍</span>
              <input type="text" id="cms-cmd-input" class="cms-cmd-input" placeholder="Switch to any tactical tool or studio..." oninput="CMSNav.filterCommandPalette(this.value)">
              <span class="cms-nav-kbd">ESC</span>
            </div>
            <div class="cms-cmd-list" id="cms-cmd-list">
              ${itemsHtml}
            </div>
          </div>
        </div>
      `;
    },

    openCommandPalette: function() {
      let backdrop = document.getElementById('cms-cmd-backdrop');
      if (!backdrop) {
        document.body.insertAdjacentHTML('beforeend', this.renderCommandPaletteHtml());
        backdrop = document.getElementById('cms-cmd-backdrop');
      }
      if (backdrop) {
        backdrop.style.display = 'flex';
        const input = document.getElementById('cms-cmd-input');
        if (input) {
          input.value = '';
          input.focus();
        }
      }
    },

    closeCommandPalette: function() {
      const backdrop = document.getElementById('cms-cmd-backdrop');
      if (backdrop) {
        backdrop.style.display = 'none';
      }
    },

    filterCommandPalette: function(query) {
      const q = (query || '').toLowerCase().trim();
      const list = document.getElementById('cms-cmd-list');
      if (!list) return;
      const items = list.querySelectorAll('.cms-cmd-item');
      let firstVisible = null;

      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          item.style.display = 'flex';
          item.classList.remove('selected');
          if (!firstVisible) firstVisible = item;
        } else {
          item.style.display = 'none';
        }
      });

      if (firstVisible) {
        firstVisible.classList.add('selected');
      }
    },

    init: function() {
      // Global shortcut: Ctrl+K / Cmd+K
      window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          const backdrop = document.getElementById('cms-cmd-backdrop');
          if (backdrop && backdrop.style.display === 'flex') {
            this.closeCommandPalette();
          } else {
            this.openCommandPalette();
          }
        } else if (e.key === 'Escape') {
          this.closeCommandPalette();
          const drawer = document.getElementById('cms-sync-drawer');
          if (drawer) drawer.style.display = 'none';
          syncDrawerOpen = false;
        }
      });

      // Close sync drawer when clicking outside
      document.addEventListener('pointerdown', (e) => {
        const drawer = document.getElementById('cms-sync-drawer');
        const pill = document.getElementById('cms-nav-sync-pill');
        if (drawer && syncDrawerOpen && !drawer.contains(e.target) && !pill.contains(e.target)) {
          drawer.style.display = 'none';
          syncDrawerOpen = false;
        }
      });

      // Auto-mount into mount element if present
      const autoMount = () => {
        const mount = document.getElementById('cms-suite-header-mount');
        if (mount && !document.getElementById('cms-universal-topbar')) {
          mount.innerHTML = this.renderHeaderHtml();
        }
        if (window.CMSStorage) {
          window.CMSStorage.applyPitchModeToPage();
          window.CMSStorage.getOfflineQueueCount().then(count => {
            this.updateSyncPill(navigator.onLine ? (count > 0 ? 'syncing' : 'online') : 'offline', count);
          });
        }
      };

      // Listen to storage sync events
      if (window.CMSStorage && typeof window.CMSStorage.onSyncStatusChange === 'function') {
        window.CMSStorage.onSyncStatusChange((status, count) => {
          this.updateSyncPill(status, count);
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoMount);
      } else {
        autoMount();
      }
    },

    mountHeader: function(targetId) {
      const el = typeof targetId === 'string' ? document.getElementById(targetId) : targetId;
      if (el) {
        el.innerHTML = this.renderHeaderHtml();
      }
    }
  };

  window.CMSNav = CMSNav;
  CMSNav.init();

})(window, document);
