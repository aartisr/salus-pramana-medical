/**
 * IndexedDB Service for storing and managing Recent Clinical Searches
 * Stores the last 5 search queries with timestamp and fast retrieval.
 */

const DB_NAME = 'salus_pramana_db';
const DB_VERSION = 1;
const STORE_NAME = 'recent_searches';
const MAX_RECENT_SEARCHES = 5;

export interface RecentSearchItem {
  query: string;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'query' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

// Fallback to localStorage if IndexedDB is blocked in sandboxed contexts
const LOCAL_STORAGE_KEY = 'salus_recent_searches_fallback';

function getFallbackStorage(): RecentSearchItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFallbackStorage(items: RecentSearchItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENT_SEARCHES)));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Retrieve the last 5 recent searches, sorted by most recent first
 */
export async function getRecentSearches(): Promise<RecentSearchItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Most recent first
      const results: RecentSearchItem[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && results.length < MAX_RECENT_SEARCHES) {
          results.push({
            query: cursor.value.query,
            timestamp: cursor.value.timestamp,
          });
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        resolve(getFallbackStorage());
      };
    });
  } catch {
    return getFallbackStorage();
  }
}

/**
 * Save a new search query (deduplicates, bumps to top, keeps max 5)
 */
export async function saveRecentSearch(query: string): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return;

  const newItem: RecentSearchItem = {
    query: trimmed,
    timestamp: Date.now(),
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      // Put new or updated record
      const putRequest = store.put(newItem);

      putRequest.onsuccess = () => {
        // Prune older entries if count exceeds MAX_RECENT_SEARCHES
        const index = store.index('timestamp');
        const cursorRequest = index.openCursor(null, 'prev');
        let count = 0;

        cursorRequest.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            count++;
            if (count > MAX_RECENT_SEARCHES) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Update localStorage fallback
    const items = getFallbackStorage().filter((i) => i.query.toLowerCase() !== trimmed.toLowerCase());
    items.unshift(newItem);
    saveFallbackStorage(items);
  }
}

/**
 * Delete a single recent search query
 */
export async function deleteRecentSearch(query: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(query);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const items = getFallbackStorage().filter((i) => i.query !== query);
    saveFallbackStorage(items);
  }
}

/**
 * Clear all recent searches
 */
export async function clearRecentSearches(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}
