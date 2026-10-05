import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  QuerySnapshot,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "./firebase";
import { ClipResult, IClipCreate } from "./types";

// status enum
// 0: active
// 1: deleted

const ClipStatus = {
  Active: "active",
  Deleted: "deleted",
} as const;

// 앱은 인증 완료를 기다리지 않고 렌더링되므로, 서버 요청 전에 인증 상태를 기다림
const getCurrentUser = async () => {
  await auth.authStateReady();
  return auth.currentUser;
};

export const deleteClip = async (id: string) => {
  const user = await getCurrentUser();
  if (user === null) {
    console.warn("User is not logged in");
    return;
  }
  const docRef = doc(db, "clips", id);
  await updateDoc(docRef, { status: ClipStatus.Deleted });
};

export const addClip = async ({
  text,
  type,
  file,
}: IClipCreate): Promise<{ id: string; createDatetime: number } | undefined> => {
  const user = await getCurrentUser();
  if (user === null) {
    console.warn("User is not logged in");
    return;
  }

  const hasFile = file && file.size > 0;

  if (!text && !hasFile) {
    console.warn("No dataText or file");
    return;
  }

  const createDatetime = Date.now();
  const payload = {
    userId: user.uid,
    username: user.displayName,
    createDatetime,
    type,
    text: text || "",
    status: ClipStatus.Active,
  };

  const docRef = await addDoc(collection(db, "clips"), payload);
  if (hasFile) {
    const locationRef = ref(storage, `clips/${user.uid}/${docRef.id}`);
    const result = await uploadBytes(locationRef, file);
    const url = await getDownloadURL(result.ref);
    updateDoc(docRef, { imageUrl: url });
  }
  return { id: docRef.id, createDatetime };
};

export const getClips = async (
  size: number = 10,
  prevSnapshot?: QuerySnapshot
): Promise<ClipResult> => {
  const user = await getCurrentUser();
  if (user === null) {
    console.warn("User is not logged in");
    return { clips: [] };
  }
  let clipsQuery = null;

  if (prevSnapshot === undefined) {
    clipsQuery = query(
      collection(db, "clips"),
      where("status", "==", ClipStatus.Active),
      where("userId", "==", user.uid),
      orderBy("createDatetime", "desc"),
      limit(size)
    );
  } else {
    const lastVisible = prevSnapshot.docs[prevSnapshot.docs.length - 1];
    clipsQuery = query(
      collection(db, "clips"),
      where("status", "==", ClipStatus.Active),
      where("userId", "==", user.uid),
      orderBy("createDatetime", "desc"),
      startAfter(lastVisible),
      limit(size)
    );
  }

  const documentSnapshot = await getDocs(clipsQuery);
  const clips = documentSnapshot.docs.map((doc) => {
    const { userId, username, createDatetime, type, text, imageUrl } =
      doc.data();
    return {
      id: doc.id,
      userId,
      username,
      createDatetime,
      type,
      text,
      imageUrl,
    };
  });
  return { clips, snapshot: documentSnapshot };
};
