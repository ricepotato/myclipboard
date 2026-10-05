import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "./firebase";
import {
  deleteLocalClip,
  getLocalClip,
  listLocalClips,
  LocalClip,
  newLocalId,
  putLocalClip,
  removeIfUnchanged,
  updateLocalClipText,
} from "./localStore";
import { IClip, IClipCreate } from "./types";

// status enum
// 0: active
// 1: deleted

const ClipStatus = {
  Active: "active",
  Deleted: "deleted",
} as const;

const SYNCED_EVENT = "clips-synced";
const UPDATED_EVENT = "clip-updated";

// 앱은 인증 완료를 기다리지 않고 렌더링되므로, 서버 요청 전에 인증 상태를 기다림
const getCurrentUser = async () => {
  await auth.authStateReady();
  return auth.currentUser;
};

// 오프라인이면 Firestore 쓰기는 로컬 캐시에 즉시 반영되지만 서버 응답까지 promise가 끝나지 않음.
// 이때는 기다리지 않고 성공으로 처리하고, 연결되면 Firestore가 알아서 전송함
const writeToFirestore = async (write: Promise<void>) => {
  if (navigator.onLine) {
    await write;
  } else {
    write.catch(console.error);
  }
};

export const deleteClip = async (id: string) => {
  // 아직 서버에 올라가지 않은 클립이면 로컬에서만 지움
  if (await getLocalClip(id)) {
    await deleteLocalClip(id);
    return;
  }
  const user = await getCurrentUser();
  if (user === null) {
    console.warn("User is not logged in");
    return;
  }
  await writeToFirestore(updateDoc(doc(db, "clips", id), { status: ClipStatus.Deleted }));
};

// 저장은 항상 브라우저에 먼저 하고, 서버 업로드는 백그라운드 동기화에 맡김
export const addClip = async ({
  text,
  type,
  file,
}: IClipCreate): Promise<{ id: string; createDatetime: number } | undefined> => {
  const hasFile = file && file.size > 0;

  if (!text && !hasFile) {
    console.warn("No dataText or file");
    return;
  }

  const user = await getCurrentUser();
  const clip: LocalClip = {
    id: newLocalId(),
    createDatetime: Date.now(),
    type,
    text: text || "",
    file: hasFile ? file : undefined,
    ownerUid: user?.uid ?? null,
  };
  await putLocalClip(clip);
  syncPendingClips();
  return { id: clip.id, createDatetime: clip.createDatetime };
};

export const getClip = async (id: string): Promise<IClip | undefined> => {
  const local = await getLocalClip(id);
  if (local) {
    return { id: local.id, userId: "", username: "", createDatetime: local.createDatetime, type: local.type, text: local.text, pending: true };
  }
  const user = await getCurrentUser();
  if (user === null) {
    console.warn("User is not logged in");
    return;
  }
  const snapshot = await getDoc(doc(db, "clips", id));
  const data = snapshot.data();
  // 다른 사용자의 클립이나 삭제된 클립은 없는 것으로 취급
  if (!data || data.userId !== user.uid || data.status !== ClipStatus.Active) {
    return;
  }
  const { userId, username, createDatetime, type, text, imageUrl } = data;
  return { id: snapshot.id, userId, username, createDatetime, type, text, imageUrl };
};

export const updateClip = async (id: string, text: string): Promise<boolean> => {
  if (await updateLocalClipText(id, text)) {
    syncPendingClips();
    return true;
  }
  const user = await getCurrentUser();
  if (user === null) {
    console.warn("User is not logged in");
    return false;
  }
  await writeToFirestore(
    updateDoc(doc(db, "clips", id), { text, updateDatetime: Date.now() })
  );
  window.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail: { id, text } }));
  return true;
};

// 서버 클립이 수정되었을 때 (목록 화면이 떠 있지 않아도 메모리의 목록을 갱신하기 위해 사용)
export const onClipUpdated = (listener: (clip: { id: string; text: string }) => void) => {
  const handler = (e: Event) => listener((e as CustomEvent<{ id: string; text: string }>).detail);
  window.addEventListener(UPDATED_EVENT, handler);
  return () => window.removeEventListener(UPDATED_EVENT, handler);
};

// 현재 사용자에게 보여줄 로컬 클립. 다른 계정으로 저장된 것은 제외
export const listPendingClips = async (): Promise<LocalClip[]> => {
  const user = await getCurrentUser();
  const clips = await listLocalClips();
  return clips.filter((clip) => clip.ownerUid === null || clip.ownerUid === user?.uid);
};

export const onClipsSynced = (listener: (clips: IClip[]) => void) => {
  const handler = (e: Event) => listener((e as CustomEvent<IClip[]>).detail);
  window.addEventListener(SYNCED_EVENT, handler);
  return () => window.removeEventListener(SYNCED_EVENT, handler);
};

let syncing: Promise<void> | undefined;
let syncRequested = false;

// 로컬 클립을 서버로 올림. 실행 중에 다시 호출되면 끝난 뒤 한 번 더 실행
export const syncPendingClips = (): Promise<void> => {
  if (syncing) {
    syncRequested = true;
    return syncing;
  }
  syncing = (async () => {
    try {
      do {
        syncRequested = false;
        await uploadPendingClips();
      } while (syncRequested);
    } finally {
      syncing = undefined;
    }
  })();
  return syncing;
};

const uploadPendingClips = async () => {
  const user = await getCurrentUser();
  if (user === null || !navigator.onLine) return;

  const synced: IClip[] = [];
  for (const clip of await listPendingClips()) {
    try {
      let imageUrl: string | undefined;
      if (clip.file) {
        const result = await uploadBytes(ref(storage, `clips/${user.uid}/${clip.id}`), clip.file);
        imageUrl = await getDownloadURL(result.ref);
      }
      const payload = {
        userId: user.uid,
        username: user.displayName,
        createDatetime: clip.createDatetime,
        type: clip.type,
        text: clip.text,
        status: ClipStatus.Active,
        ...(imageUrl ? { imageUrl } : {}),
      };
      // 로컬 id를 문서 id로 쓰므로 다시 올려도 같은 문서를 덮어씀
      await setDoc(doc(db, "clips", clip.id), payload);

      const outcome = await removeIfUnchanged(clip);
      if (outcome === "missing") {
        // 업로드 도중 사용자가 삭제한 경우 서버에서도 삭제 처리
        await updateDoc(doc(db, "clips", clip.id), { status: ClipStatus.Deleted });
      } else if (outcome === "removed") {
        synced.push({ id: clip.id, ...payload, username: payload.username ?? "" });
      } else {
        // 업로드 도중 수정됨. 바뀐 내용으로 한 번 더 올림
        syncRequested = true;
      }
    } catch (e) {
      // 실패한 클립은 로컬에 남겨 두고 다음 동기화 때 다시 시도
      console.error("Failed to sync clip", clip.id, e);
    }
  }
  if (synced.length > 0) {
    window.dispatchEvent(new CustomEvent(SYNCED_EVENT, { detail: synced }));
  }
};

// 앱 시작, 로그인, 온라인 복귀 시점에 동기화
export const startBackgroundSync = () => {
  onAuthStateChanged(auth, () => syncPendingClips());
  window.addEventListener("online", () => syncPendingClips());
};

// 최신순으로 size개를 가져옴. before를 주면 그 시각보다 오래된 클립부터 가져옴
export const getClips = async (size: number, before?: number): Promise<IClip[]> => {
  const user = await getCurrentUser();
  if (user === null) {
    return [];
  }
  const clipsQuery = query(
    collection(db, "clips"),
    where("status", "==", ClipStatus.Active),
    where("userId", "==", user.uid),
    orderBy("createDatetime", "desc"),
    ...(before !== undefined ? [startAfter(before)] : []),
    limit(size)
  );

  const documentSnapshot = await getDocs(clipsQuery);
  return documentSnapshot.docs.map((doc) => {
    const { userId, username, createDatetime, type, text, imageUrl } = doc.data();
    return { id: doc.id, userId, username, createDatetime, type, text, imageUrl };
  });
};
