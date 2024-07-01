import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "./firebase";
import { IClip, IClipCreate } from "./types";

// status enum
// 0: active
// 1: deleted

const ClipStatus = {
  Active: "active",
  Deleted: "deleted",
} as const;

export const deleteClip = async (id: string) => {
  const user = auth.currentUser;
  if (user === null) {
    console.warn("User is not logged in");
    return;
  }
  const docRef = doc(db, "clips", id);
  await updateDoc(docRef, { status: ClipStatus.Deleted });
};

export const addClip = async ({ text, type, file }: IClipCreate) => {
  console.log(text, type, file);
  const user = auth.currentUser;
  if (user === null) {
    console.warn("User is not logged in");
    return;
  }

  if (text === undefined && file === undefined) {
    console.warn("No dataText or file");
    return;
  }

  const payload = {
    userId: user.uid,
    username: user.displayName,
    createDatetime: Date.now(),
    type,
    text: text || "",
    status: ClipStatus.Active,
  };

  const doc = await addDoc(collection(db, "clips"), payload);
  if (file) {
    const locationRef = ref(storage, `clips/${user.uid}/${doc.id}`);
    const result = await uploadBytes(locationRef, file);
    const url = await getDownloadURL(result.ref);
    updateDoc(doc, { imageUrl: url });
  }
};

export const getClips = async (size: number = 10): Promise<IClip[]> => {
  const user = auth.currentUser;
  if (user === null) {
    console.warn("User is not logged in");
    return [];
  }
  const clipsQuery = query(
    collection(db, "clips"),
    where("status", "==", ClipStatus.Active),
    orderBy("createDatetime", "desc"),
    limit(size)
  );
  const snapshot = await getDocs(clipsQuery);
  const result = snapshot.docs.map((doc) => {
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
  return result;
};
