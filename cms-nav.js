/**
 * Coach Management System (CMS) — GA Edition
 * Universal Suite Navigation & Command Palette Engine
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

  const CMSNav = {
    currentToolId: getCurrentTool(),

    renderHeaderHtml: function() {
      const current = this.currentToolId;
      const branding = getClubBranding();
      const currentToolObj = TOOLS.find(t => t.id === current) || TOOLS[0];

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
            <button type="button" class="cms-nav-cmd-btn" onclick="CMSNav.openCommandPalette()" title="Quick Switcher (Press Ctrl+K or Cmd+K)">
              <span>⚡ Switcher</span>
              <span class="cms-nav-kbd">⌘K</span>
            </button>
            ${current !== 'squad' ? `
              <a href="index.html" class="cms-nav-action-btn" title="Back to Squad Dashboard">
                <span>← Dashboard</span>
              </a>
            ` : ''}
          </div>
        </header>
      `;
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
          <div class="cms-cmd-modal" role="dialog" aria-modal="true">
            <div class="cms-cmd-input-wrap">
              <span style="font-size:16px;">🔍</span>
              <input type="text" id="cms-cmd-search" class="cms-cmd-input" placeholder="Type a tool name or command (e.g. Video, Session, Report)…" autocomplete="off" spellcheck="false">
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
        this.bindPaletteEvents();
      }
      backdrop.classList.add('open');
      const inp = document.getElementById('cms-cmd-search');
      if (inp) {
        inp.value = '';
        inp.focus();
        this.filterPalette('');
      }
    },

    closeCommandPalette: function() {
      const backdrop = document.getElementById('cms-cmd-backdrop');
      if (backdrop) {
        backdrop.classList.remove('open');
      }
    },

    bindPaletteEvents: function() {
      const inp = document.getElementById('cms-cmd-search');
      const list = document.getElementById('cms-cmd-list');
      if (!inp || !list) return;

      inp.addEventListener('input', (e) => {
        this.filterPalette(e.target.value);
      });

      inp.addEventListener('keydown', (e) => {
        const visible = Array.from(list.querySelectorAll('.cms-cmd-item:not([style*="display: none"])'));
        if (!visible.length) return;
        const currentIdx = visible.findIndex(item => item.classList.contains('selected'));

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = (currentIdx + 1) % visible.length;
          visible.forEach(item => item.classList.remove('selected'));
          visible[next].classList.add('selected');
          visible[next].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = (currentIdx - 1 + visible.length) % visible.length;
          visible.forEach(item => item.classList.remove('selected'));
          visible[prev].classList.add('selected');
          visible[prev].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const sel = visible[currentIdx >= 0 ? currentIdx : 0];
          if (sel && sel.getAttribute('data-url')) {
            window.location.href = sel.getAttribute('data-url');
          }
        } else if (e.key === 'Escape') {
          this.closeCommandPalette();
        }
      });
    },

    filterPalette: function(query) {
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
          if (backdrop && backdrop.classList.contains('open')) {
            this.closeCommandPalette();
          } else {
            this.openCommandPalette();
          }
        } else if (e.key === 'Escape') {
          this.closeCommandPalette();
        }
      });

      // Auto-mount into mount element if present
      const autoMount = () => {
        const mount = document.getElementById('cms-suite-header-mount');
        if (mount && !document.getElementById('cms-universal-topbar')) {
          mount.innerHTML = this.renderHeaderHtml();
        }
      };
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
