/**
 * Coach Management System (CMS) — GA Edition
 * Cross-Window & Cross-Tool Realtime Event Bus (CMSBus)
 * 
 * Synchronizes squad rosters, lineup changes, video clips, and session updates
 * instantly across all open browser windows and tabs without requiring a server roundtrip.
 * Uses BroadcastChannel('CMS_BUS') with resilient localStorage fallback.
 */
(function(window) {
  'use strict';

  const CHANNEL_NAME = 'CMS_BUS';
  const LEGACY_CHANNEL_NAME = 'CMS_EVENT_BUS';

  const EVENTS = {
    PLAYER_ROSTER_SYNC: 'cms:player_roster_sync',
    LINEUP_PUBLISHED: 'cms:lineup_published',
    TACTICAL_SESSION_EXPORT: 'cms:tactical_session_export',
    VIDEO_CLIP_HANDOFF: 'cms:video_clip_handoff',
    MATCH_REPORT_SAVED: 'cms:match_report_saved',
    // Backwards-compatible aliases
    ROSTER_UPDATED: 'cms:player_roster_sync',
    SESSION_SAVED: 'cms:tactical_session_export',
    CLIP_EXPORTED: 'cms:video_clip_handoff'
  };

  const listeners = {};
  let channel = null;

  const clientId = 'cms_tab_' + Math.random().toString(36).substring(2, 9);

  function dispatch(type, payload, senderId) {
    if (senderId === clientId) return; // Ignore self-published events to prevent echo loops

    // Trigger exact event listeners
    if (listeners[type]) {
      listeners[type].forEach(fn => {
        try { fn(payload, senderId); } catch (e) { console.error('[CMSBus] Listener error:', e); }
      });
    }

    // Trigger legacy alias listeners if any
    Object.keys(EVENTS).forEach(aliasKey => {
      const canonical = EVENTS[aliasKey];
      if (canonical === type && aliasKey !== type && listeners[aliasKey]) {
        listeners[aliasKey].forEach(fn => {
          try { fn(payload, senderId); } catch (e) { console.error('[CMSBus] Alias listener error:', e); }
        });
      }
    });

    // Trigger wildcard listeners
    if (listeners['*']) {
      listeners['*'].forEach(fn => {
        try { fn(type, payload, senderId); } catch (e) { console.error('[CMSBus] Wildcard listener error:', e); }
      });
    }
  }

  // Initialize BroadcastChannel or localStorage fallback
  try {
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = function(event) {
        if (!event || !event.data) return;
        const { type, payload, senderId } = event.data;
        dispatch(type, payload, senderId);
      };
    }
  } catch (err) {
    console.warn('[CMSBus] BroadcastChannel error, using storage event fallback:', err);
  }

  // Always listen to localStorage storage events as fallback/cross-origin-tab backup
  window.addEventListener('storage', (e) => {
    if ((e.key === CHANNEL_NAME || e.key === LEGACY_CHANNEL_NAME) && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        dispatch(data.type, data.payload, data.senderId);
      } catch (_) {}
    }
  });

  function showBusToast(message, icon) {
    let toast = document.getElementById('cms-bus-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cms-bus-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: rgba(12, 18, 30, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(0, 230, 118, 0.45);
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.55), 0 0 18px rgba(0, 230, 118, 0.25);
        color: #f8fafc;
        padding: 10px 18px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 13px;
        font-weight: 600;
        z-index: 100001;
        transform: translateY(80px);
        opacity: 0;
        transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span style="font-size:18px;line-height:1;">${icon || '⚡'}</span>
      <span style="letter-spacing:0.01em;">${message}</span>
    `;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      toast.style.transform = 'translateY(80px)';
      toast.style.opacity = '0';
    }, 3400);
  }

  const CMSBus = {
    EVENTS: EVENTS,
    clientId: clientId,

    /**
     * Publish an event to all open tabs, windows, and local listeners
     * @param {string} type - Event type from CMSBus.EVENTS
     * @param {any} payload - Event data
     */
    publish: function(type, payload) {
      // Normalize to canonical event name if alias passed
      const canonicalType = EVENTS[type] || type;
      const data = {
        type: canonicalType,
        payload: payload,
        senderId: clientId,
        timestamp: Date.now()
      };

      if (channel) {
        try {
          channel.postMessage(data);
        } catch(e) {
          console.warn('[CMSBus] postMessage error, writing storage fallback', e);
        }
      }

      // Also set storage event for windows that don't support BroadcastChannel or cross-context
      try {
        localStorage.setItem(CHANNEL_NAME, JSON.stringify(data));
        setTimeout(() => {
          try { localStorage.removeItem(CHANNEL_NAME); } catch(_) {}
        }, 80);
      } catch (_) {}

      // Dispatch to local listeners inside this window
      if (listeners[canonicalType]) {
        listeners[canonicalType].forEach(fn => {
          try { fn(payload, clientId); } catch (e) { console.error('[CMSBus] Local listener error:', e); }
        });
      }
      if (listeners['*']) {
        listeners['*'].forEach(fn => {
          try { fn(canonicalType, payload, clientId); } catch (e) { console.error('[CMSBus] Wildcard listener error:', e); }
        });
      }
    },

    /**
     * Subscribe to an event
     * @param {string} type - Event type or '*'
     * @param {Function} callback - Function(payload, senderId)
     */
    subscribe: function(type, callback) {
      const canonicalType = EVENTS[type] || type;
      if (!listeners[canonicalType]) listeners[canonicalType] = [];
      listeners[canonicalType].push(callback);
      return () => this.unsubscribe(canonicalType, callback);
    },

    /**
     * Unsubscribe from an event
     */
    unsubscribe: function(type, callback) {
      const canonicalType = EVENTS[type] || type;
      if (!listeners[canonicalType]) return;
      listeners[canonicalType] = listeners[canonicalType].filter(fn => fn !== callback);
    },

    /**
     * Show non-intrusive synchronization toast HUD
     */
    notify: showBusToast
  };

  window.CMSBus = CMSBus;

  // Standard toast handlers for automated feedback across tools
  CMSBus.subscribe(EVENTS.LINEUP_PUBLISHED, (data) => {
    const name = data.formation || data.name || 'Tactical XI';
    CMSBus.notify(`Lineup "${name}" updated from Tactics Studio`, '🧩');
  });

  CMSBus.subscribe(EVENTS.VIDEO_CLIP_HANDOFF, (data) => {
    const title = data.title || 'Match Highlight';
    CMSBus.notify(`Video Clip "${title}" ready in library`, '📹');
  });

  CMSBus.subscribe(EVENTS.TACTICAL_SESSION_EXPORT, (data) => {
    const title = data.sessionTitle || data.title || 'Training Session';
    CMSBus.notify(`Session Plan "${title}" synced across suite`, '📋');
  });

  CMSBus.subscribe(EVENTS.PLAYER_ROSTER_SYNC, (data) => {
    const count = Array.isArray(data.players) ? data.players.length : (data.count || 0);
    CMSBus.notify(`Squad roster synced (${count} players)`, '⚡');
  });

})(window);
