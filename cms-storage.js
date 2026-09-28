/**
 * Coach Management System (CMS) — GA Edition
 * High-Capacity IndexedDB Storage Engine (CMSStorage / CMS_DB)
 * 
 * Provides an asynchronous, resilient key-value and binary blob store
 * for high-volume tactical data (video breakdowns, player tracking keyframes,
 * session drill diagrams, and lineup templates) eliminating the 5MB localStorage limit.
 * Includes an automated Least-Recently-Used (LRU) eviction policy to prevent QuotaExceededError.
 */
(function(window) {
  'use strict';

  const DB_NAME = 'CMS_Tactical_Store';
  const DB_VERSION = 2;
  const STORE_KEYVAL = 'cms_keyval';
  const STORE_BLOBS = 'cms_blobs';
  const MAX_BLOB_ITEMS = 60; // Max stored video clips / frames before LRU kicks in

  let dbPromise = null;

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
            // Also store lightweight backup in localStorage if < 20KB for legacy sync readers
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
        // Enforce LRU eviction threshold
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
              // Update lastAccessed for LRU
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
                // Do not evict pinned items
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

    /**
     * Clear all stored tactical data in CMSStorage
     */
    clear: async function() {
      try {
        const db = await openDB();
        if (db) {
          const tx = db.transaction([STORE_KEYVAL, STORE_BLOBS], 'readwrite');
          tx.objectStore(STORE_KEYVAL).clear();
          tx.objectStore(STORE_BLOBS).clear();
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

  // Expose both CMSStorage and CMS_DB for spec adherence
  window.CMSStorage = CMSStorage;
  window.CMS_DB = CMSStorage;

})(window);
