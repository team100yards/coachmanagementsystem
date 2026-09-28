/**
 * Coach Management System (CMS) — GA Edition
 * High-Capacity IndexedDB Storage & Offline Resilience Engine (CMSStorage / CMS_DB)
 * 
 * Provides an asynchronous, resilient key-value, binary blob, and offline mutation store.
 * Includes:
 * 1. Automated Least-Recently-Used (LRU) eviction to prevent QuotaExceededError.
 * 2. Transparent localStorage fallback.
 * 3. Offline mutation queue & auto-reconnect synchronization machine.
 * 4. High-contrast Sunlight Turf vs Midnight Tactical pitch mode engine.
 */
(function(window) {
  'use strict';

  const DB_NAME = 'CMS_Tactical_Store';
  const DB_VERSION = 3;
  const STORE_KEYVAL = 'cms_keyval';
  const STORE_BLOBS = 'cms_blobs';
  const STORE_OFFLINE_QUEUE = 'cms_offline_queue';
  const MAX_BLOB_ITEMS = 60; // Max stored video clips / frames before LRU kicks in

  let dbPromise = null;
  const syncListeners = [];

  function openDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('[CMSStorage] IndexedDB unavailable; operating in localStorage fallback mode.');
        return resolve(null);
      }

      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_KEYVAL)) {
            db.createObjectStore(STORE_KEYVAL);
          }
          if (!db.objectStoreNames.contains(STORE_BLOBS)) {
            const blobStore = db.createObjectStore(STORE_BLOBS, { keyPath: 'id' });
            blobStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
            blobStore.createIndex('createdAt', 'createdAt', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORE_OFFLINE_QUEUE)) {
            const qStore = db.createObjectStore(STORE_OFFLINE_QUEUE, { keyPath: 'queueId' });
            qStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };

        req.onsuccess = (e) => {
          resolve(e.target.result);
        };

        req.onerror = (e) => {
          console.error('[CMSStorage] IndexedDB open failed:', e.target.error);
          resolve(null);
        };
      } catch (err) {
        console.error('[CMSStorage] IndexedDB initialization exception:', err);
        resolve(null);
      }
    });

    return dbPromise;
  }

  function notifySyncChange(status, pendingCount = 0) {
    syncListeners.forEach(fn => {
      try { fn(status, pendingCount); } catch(e) {}
    });
    if (window.CMSNav && typeof window.CMSNav.updateSyncPill === 'function') {
      window.CMSNav.updateSyncPill(status, pendingCount);
    }
  }

  const CMSStorage = {
    /**
     * Get item by key from IndexedDB with fallback to localStorage
     * @param {string} key
     * @returns {Promise<any>}
     */
    get: async function(key) {
      try {
        const db = await openDB();
        if (!db) {
          const val = localStorage.getItem(key);
          try { return JSON.parse(val); } catch(_) { return val; }
        }

        return new Promise((resolve) => {
          const tx = db.transaction(STORE_KEYVAL, 'readonly');
          const store = tx.objectStore(STORE_KEYVAL);
          const req = store.get(key);

          req.onsuccess = () => {
            if (req.result !== undefined) {
              resolve(req.result);
            } else {
              const localVal = localStorage.getItem(key);
              try { resolve(JSON.parse(localVal)); } catch(_) { resolve(localVal); }
            }
          };

          req.onerror = () => {
            const localVal = localStorage.getItem(key);
            try { resolve(JSON.parse(localVal)); } catch(_) { resolve(localVal); }
          };
        });
      } catch (err) {
        console.warn('[CMSStorage] get error for ' + key, err);
        const val = localStorage.getItem(key);
        try { return JSON.parse(val); } catch(_) { return val; }
      }
    },

    /**
     * Set item in IndexedDB and mirror key in localStorage if small (<20KB)
     * @param {string} key
     * @param {any} value
     * @returns {Promise<void>}
     */
    set: async function(key, value) {
      try {
        const db = await openDB();
        if (!db) {
          try {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          } catch(e) {
            console.error('[CMSStorage] localStorage quota exceeded', e);
          }
          return;
        }

        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_KEYVAL, 'readwrite');
          const store = tx.objectStore(STORE_KEYVAL);
          const req = store.put(value, key);

          req.onsuccess = () => {
            try {
              const str = typeof value === 'string' ? value : JSON.stringify(value);
              if (str.length < 20000) {
                localStorage.setItem(key, str);
              }
            } catch(_) {}
            resolve();
          };

          req.onerror = (e) => {
            console.error('[CMSStorage] set error:', e.target.error);
            try {
              localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            } catch(_) {}
            resolve();
          };
        });
      } catch (err) {
        console.warn('[CMSStorage] set error for ' + key, err);
        try {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch(_) {}
      }
    },

    /**
     * Remove item by key
     * @param {string} key
     * @returns {Promise<void>}
     */
    remove: async function(key) {
      try {
        localStorage.removeItem(key);
        const db = await openDB();
        if (!db) return;

        return new Promise((resolve) => {
          const tx = db.transaction(STORE_KEYVAL, 'readwrite');
          const store = tx.objectStore(STORE_KEYVAL);
          const req = store.delete(key);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        });
      } catch (err) {
        console.warn('[CMSStorage] remove error for ' + key, err);
      }
    },

    /**
     * List all keys in keyval store
     * @returns {Promise<string[]>}
     */
    keys: async function() {
      try {
        const db = await openDB();
        if (!db) {
          const res = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k) res.push(k);
          }
          return res;
        }

        return new Promise((resolve) => {
          const tx = db.transaction(STORE_KEYVAL, 'readonly');
          const store = tx.objectStore(STORE_KEYVAL);
          const req = store.getAllKeys();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => {
            const res = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k) res.push(k);
            }
            resolve(res);
          };
        });
      } catch (err) {
        const res = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) res.push(k);
        }
        return res;
      }
    },

    /**
     * Store high-capacity binary blob (MP4/WebM video, canvas frames, raw tracking tracks)
     * Automatically applies LRU eviction policy to protect disk quota.
     * @param {string} id
     * @param {Blob|ArrayBuffer|string} data
     * @param {object} meta
     * @returns {Promise<void>}
     */
    setBlob: async function(id, data, meta = {}) {
      try {
        await this.evictOldBlobs(MAX_BLOB_ITEMS - 1);
        const db = await openDB();
        if (!db) return;

        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_BLOBS, 'readwrite');
          const store = tx.objectStore(STORE_BLOBS);
          const record = {
            id: id,
            data: data,
            meta: meta,
            size: data.size || (typeof data === 'string' ? data.length : 0),
            createdAt: meta.createdAt || Date.now(),
            lastAccessed: Date.now()
          };
          const req = store.put(record);
          req.onsuccess = () => resolve();
          req.onerror = (e) => reject(e.target.error);
        });
      } catch (err) {
        console.error('[CMSStorage] setBlob error for ' + id, err);
      }
    },

    /**
     * Retrieve high-capacity blob by id and update LRU lastAccessed
     * @param {string} id
     * @returns {Promise<any>}
     */
    getBlob: async function(id) {
      try {
        const db = await openDB();
        if (!db) return null;

        return new Promise((resolve) => {
          const tx = db.transaction(STORE_BLOBS, 'readwrite');
          const store = tx.objectStore(STORE_BLOBS);
          const req = store.get(id);

          req.onsuccess = () => {
            const record = req.result;
            if (record) {
              record.lastAccessed = Date.now();
              store.put(record);
              resolve(record);
            } else {
              resolve(null);
            }
          };

          req.onerror = () => resolve(null);
        });
      } catch (err) {
        console.warn('[CMSStorage] getBlob error for ' + id, err);
        return null;
      }
    },

    /**
     * Delete a stored blob by id
     * @param {string} id
     * @returns {Promise<void>}
     */
    removeBlob: async function(id) {
      try {
        const db = await openDB();
        if (!db) return;

        return new Promise((resolve) => {
          const tx = db.transaction(STORE_BLOBS, 'readwrite');
          const store = tx.objectStore(STORE_BLOBS);
          const req = store.delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        });
      } catch (err) {
        console.warn('[CMSStorage] removeBlob error for ' + id, err);
      }
    },

    /**
     * LRU Eviction: Removes oldest accessed blobs if count exceeds maxCount
     * @param {number} maxCount
     * @returns {Promise<number>} number of evicted items
     */
    evictOldBlobs: async function(maxCount = MAX_BLOB_ITEMS) {
      try {
        const db = await openDB();
        if (!db) return 0;

        return new Promise((resolve) => {
          const tx = db.transaction(STORE_BLOBS, 'readwrite');
          const store = tx.objectStore(STORE_BLOBS);
          const countReq = store.count();

          countReq.onsuccess = () => {
            const total = countReq.result;
            if (total <= maxCount) return resolve(0);

            const toDelete = total - maxCount;
            let deletedCount = 0;

            const index = store.index('lastAccessed');
            const cursorReq = index.openCursor(); // Ascending order (oldest first)

            cursorReq.onsuccess = (e) => {
              const cursor = e.target.result;
              if (cursor && deletedCount < toDelete) {
                if (!cursor.value?.meta?.pinned) {
                  cursor.delete();
                  deletedCount++;
                }
                cursor.continue();
              } else {
                resolve(deletedCount);
              }
            };

            cursorReq.onerror = () => resolve(deletedCount);
          };

          countReq.onerror = () => resolve(0);
        });
      } catch (err) {
        console.warn('[CMSStorage] evictOldBlobs error:', err);
        return 0;
      }
    },

    // ════════════════════════════════════════════════════════════
    // OFFLINE MUTATION QUEUE & RESILIENCE ENGINE
    // ════════════════════════════════════════════════════════════

    /**
     * Queue an offline write/update mutation for background cloud sync
     * @param {object} mutation - { type, collection, docId, data }
     */
    queueOfflineMutation: async function(mutation) {
      const queueId = 'mut_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const record = {
        queueId,
        collection: mutation.collection,
        docId: mutation.docId || mutation.id,
        action: mutation.action || 'set', // 'set', 'update', 'delete'
        data: mutation.data,
        timestamp: Date.now()
      };

      try {
        const db = await openDB();
        if (db && db.objectStoreNames.contains(STORE_OFFLINE_QUEUE)) {
          const tx = db.transaction(STORE_OFFLINE_QUEUE, 'readwrite');
          tx.objectStore(STORE_OFFLINE_QUEUE).put(record);
        } else {
          // localStorage fallback
          const raw = localStorage.getItem('cms_offline_queue_fallback') || '[]';
          const list = JSON.parse(raw);
          list.push(record);
          localStorage.setItem('cms_offline_queue_fallback', JSON.stringify(list));
        }

        const count = await this.getOfflineQueueCount();
        notifySyncChange(navigator.onLine ? 'syncing' : 'offline', count);
        if (window.CMSBus) {
          window.CMSBus.notify(`Saved locally (${count} queued for cloud sync)`, '🟡');
        }
      } catch(err) {
        console.warn('[CMSStorage] Error queuing offline mutation:', err);
      }
    },

    /**
     * Retrieve all pending offline mutations
     * @returns {Promise<Array>}
     */
    getOfflineQueue: async function() {
      try {
        const db = await openDB();
        if (!db || !db.objectStoreNames.contains(STORE_OFFLINE_QUEUE)) {
          const raw = localStorage.getItem('cms_offline_queue_fallback') || '[]';
          return JSON.parse(raw);
        }

        return new Promise((resolve) => {
          const tx = db.transaction(STORE_OFFLINE_QUEUE, 'readonly');
          const store = tx.objectStore(STORE_OFFLINE_QUEUE);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });
      } catch(err) {
        return [];
      }
    },

    /**
     * Count pending offline mutations
     */
    getOfflineQueueCount: async function() {
      const q = await this.getOfflineQueue();
      return q.length;
    },

    /**
     * Remove a synchronized mutation by queueId
     */
    removeOfflineMutation: async function(queueId) {
      try {
        const db = await openDB();
        if (db && db.objectStoreNames.contains(STORE_OFFLINE_QUEUE)) {
          const tx = db.transaction(STORE_OFFLINE_QUEUE, 'readwrite');
          tx.objectStore(STORE_OFFLINE_QUEUE).delete(queueId);
        }
        const raw = localStorage.getItem('cms_offline_queue_fallback') || '[]';
        const list = JSON.parse(raw).filter(m => m.queueId !== queueId);
        localStorage.setItem('cms_offline_queue_fallback', JSON.stringify(list));
      } catch(_) {}
    },

    /**
     * Flush all queued offline mutations to Firestore when online
     * @param {object} firestoreDb - Active firebase/firestore instance
     */
    flushOfflineQueue: async function(firestoreDb) {
      const dbInstance = firestoreDb || window.db || (typeof db !== 'undefined' ? db : null);
      if (!navigator.onLine || !dbInstance) return;
      const queue = await this.getOfflineQueue();
      if (!queue.length) {
        notifySyncChange('online', 0);
        return;
      }

      notifySyncChange('syncing', queue.length);

      for (const m of queue) {
        try {
          const colRef = dbInstance.collection(m.collection);
          const docRef = m.docId ? colRef.doc(m.docId) : colRef.doc();
          if (m.action === 'delete') {
            await docRef.delete();
          } else {
            await docRef.set(m.data, { merge: true });
          }
          await this.removeOfflineMutation(m.queueId);
        } catch(err) {
          console.warn('[CMSStorage] Failed to flush mutation ' + m.queueId, err);
          notifySyncChange('error', queue.length);
          return;
        }
      }

      const remaining = await this.getOfflineQueueCount();
      notifySyncChange(remaining > 0 ? 'offline' : 'online', remaining);
      if (remaining === 0 && window.CMSBus) {
        window.CMSBus.notify('All pitchside changes synced to Cloud!', '🟢');
      }
    },

    /**
     * Subscribe to online/offline sync status transitions
     * @param {Function} fn - (status: 'online'|'offline'|'syncing'|'error', pendingCount: number) => void
     */
    onSyncStatusChange: function(fn) {
      if (typeof fn === 'function') {
        syncListeners.push(fn);
      }
    },

    // ════════════════════════════════════════════════════════════
    // HIGH-CONTRAST PITCH MODE (Sunlight Turf vs Midnight)
    // ════════════════════════════════════════════════════════════

    getPitchMode: function() {
      return localStorage.getItem('cms_pitch_mode') || 'midnight';
    },

    setPitchMode: function(mode) {
      localStorage.setItem('cms_pitch_mode', mode);
      window.CMS_PITCH_MODE = mode;
      this.applyPitchModeToPage(mode);
      if (window.CMSBus) {
        window.CMSBus.publish('cms:pitch_mode_changed', { mode });
      }
    },

    togglePitchMode: function() {
      const next = this.getPitchMode() === 'sunlight' ? 'midnight' : 'sunlight';
      this.setPitchMode(next);
      return next;
    },

    applyPitchModeToPage: function(mode = null) {
      const current = mode || this.getPitchMode();
      window.CMS_PITCH_MODE = current;
      const isSunlight = (current === 'sunlight');

      // Update tactical pitch containers
      const pitchElements = document.querySelectorAll(
        '.tactical-pitch-field, .sp-canvas-wrap, .pitch-stripe, #tactical-pitch-field, .sp-canvas-container'
      );
      pitchElements.forEach(el => {
        el.classList.toggle('cms-pitch-sunlight', isSunlight);
      });

      // Update toggles in DOM if present
      const toggles = document.querySelectorAll('.cms-pitch-mode-btn, #btn-sunlight-mode');
      toggles.forEach(btn => {
        btn.textContent = isSunlight ? '🌙 Midnight Mode' : '☀️ Sunlight Turf';
        btn.classList.toggle('active', isSunlight);
      });

      // Redraw canvas in tools if active
      if (typeof window.redrawCanvas === 'function') {
        try { window.redrawCanvas(); } catch(_) {}
      }
    },

    /**
     * Clear all stored tactical data in CMSStorage
     */
    clear: async function() {
      try {
        const db = await openDB();
        if (db) {
          const tx = db.transaction([STORE_KEYVAL, STORE_BLOBS, STORE_OFFLINE_QUEUE], 'readwrite');
          tx.objectStore(STORE_KEYVAL).clear();
          tx.objectStore(STORE_BLOBS).clear();
          tx.objectStore(STORE_OFFLINE_QUEUE).clear();
        }
        localStorage.removeItem('formation_sync_payload');
        localStorage.removeItem('cms_active_roster');
        localStorage.removeItem('cms_active_lineup');
      } catch (err) {
        console.warn('[CMSStorage] clear error:', err);
      }
    },

    /**
     * Estimate current storage usage
     * @returns {Promise<{usageMB: number, quotaMB: number, percentUsed: number}>}
     */
    getStorageUsage: async function() {
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          const usageMB = Math.round(((estimate.usage || 0) / (1024 * 1024)) * 10) / 10;
          const quotaMB = Math.round(((estimate.quota || 0) / (1024 * 1024)) * 10) / 10;
          const percentUsed = quotaMB > 0 ? Math.round((usageMB / quotaMB) * 100) : 0;
          return { usageMB, quotaMB, percentUsed };
        } catch(_) {}
      }
      return { usageMB: 0, quotaMB: 100, percentUsed: 0 };
    }
  };

  // Auto-listen to window online/offline events
  window.addEventListener('online', () => {
    CMSStorage.getOfflineQueueCount().then(count => {
      notifySyncChange(count > 0 ? 'syncing' : 'online', count);
      if (window.db) CMSStorage.flushOfflineQueue(window.db);
    });
  });

  window.addEventListener('offline', () => {
    CMSStorage.getOfflineQueueCount().then(count => {
      notifySyncChange('offline', count);
    });
  });

  // Apply saved pitch mode on page load
  document.addEventListener('DOMContentLoaded', () => {
    CMSStorage.applyPitchModeToPage();
  });

  window.CMSStorage = CMSStorage;
  window.CMS_DB = CMSStorage;

})(window);
