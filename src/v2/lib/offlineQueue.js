// Tiny IndexedDB-backed queue for intakes captured while offline (or while
// Supabase is unreachable). Everything lives under a single key,
// 'trace_offline_queue', in a small key/value store — dependency-free.

const DB_NAME = 'trace_v2';
const STORE = 'kv';
const QUEUE_KEY = 'trace_offline_queue';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function kvGet(key) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

function kvSet(key, value) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

export async function getQueue() {
  try {
    return (await kvGet(QUEUE_KEY)) || [];
  } catch {
    return [];
  }
}

// Append one intake record to the offline queue. Returns the queued item.
export async function enqueueIntake(record) {
  const queue = await getQueue();
  const item = { ...record, queuedAt: new Date().toISOString(), localId: crypto.randomUUID() };
  queue.push(item);
  await kvSet(QUEUE_KEY, queue);
  return item;
}

export async function setQueue(queue) {
  await kvSet(QUEUE_KEY, queue);
}

export async function clearQueue() {
  await kvSet(QUEUE_KEY, []);
}

export async function queueCount() {
  return (await getQueue()).length;
}
