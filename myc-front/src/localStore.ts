// 서버에 아직 올라가지 않은 클립을 브라우저(IndexedDB)에 보관하는 저장소.
// 로컬 id는 그대로 Firestore 문서 id로 쓰이므로, 동기화를 여러 번 해도 중복 생성되지 않음

export interface LocalClip {
  id: string;
  createDatetime: number;
  type: string;
  text: string;
  file?: Blob;
  // 로그인 상태에서 저장했다면 해당 계정 uid. null이면 처음 로그인하는 계정으로 올라감
  ownerUid: string | null;
}

const DB_NAME = "myclipboard";
const STORE = "pendingClips";
const CHANGE_EVENT = "local-clips-changed";

let dbPromise: Promise<IDBDatabase> | undefined;

const openDb = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE, { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = undefined;
        reject(request.error);
      };
    });
  }
  return dbPromise;
};

const run = async <T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    let result: T | undefined;
    const request = fn(tx.objectStore(STORE));
    if (request) {
      request.onsuccess = () => {
        result = request.result;
      };
    }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

const notifyChange = () => window.dispatchEvent(new Event(CHANGE_EVENT));

export const onLocalClipsChange = (listener: () => void) => {
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
};

// Firestore 자동 id와 같은 형식(20자 영숫자)으로 생성
export const newLocalId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

export const putLocalClip = async (clip: LocalClip) => {
  await run("readwrite", (store) => store.put(clip));
  notifyChange();
};

export const getLocalClip = (id: string) =>
  run<LocalClip>("readonly", (store) => store.get(id));

export const listLocalClips = async () =>
  (await run<LocalClip[]>("readonly", (store) => store.getAll())) ?? [];

export const deleteLocalClip = async (id: string) => {
  await run("readwrite", (store) => store.delete(id));
  notifyChange();
};

export const updateLocalClipText = async (id: string, text: string) => {
  let found = false;
  await run("readwrite", (store) => {
    const request = store.get(id);
    request.onsuccess = () => {
      if (!request.result) return;
      found = true;
      store.put({ ...request.result, text });
    };
  });
  if (found) notifyChange();
  return found;
};

/**
 * 업로드가 끝난 클립을 로컬에서 제거. 업로드 중에 내용이 바뀌었으면 남겨서 다음 동기화 때 다시 올림.
 * 반환값: "removed" | "changed" | "missing"(업로드 중 사용자가 삭제함)
 */
export const removeIfUnchanged = async (uploaded: LocalClip) => {
  let outcome = "missing" as "removed" | "changed" | "missing";
  await run("readwrite", (store) => {
    const request = store.get(uploaded.id);
    request.onsuccess = () => {
      const current: LocalClip | undefined = request.result;
      if (!current) return;
      if (current.text !== uploaded.text) {
        outcome = "changed";
        return;
      }
      outcome = "removed";
      store.delete(uploaded.id);
    };
  });
  if (outcome === "removed") notifyChange();
  return outcome;
};
