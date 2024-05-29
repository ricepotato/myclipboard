import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { IClipCreate, IClip } from "./types";

export const addClip = async ({ text, type, file }: IClipCreate) => {
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
    text,
  };

  await addDoc(collection(db, "clips"), payload);
};

export const getClips = async (): Promise<IClip[]> => {
  const user = auth.currentUser;
  if (user === null) {
    console.warn("User is not logged in");
    return [];
  }
  const clipsQuery = query(
    collection(db, "clips"),
    orderBy("createDatetime", "desc")
  );
  const snapshot = await getDocs(clipsQuery);
  const result = snapshot.docs.map((doc) => {
    const { userId, username, createDatetime, type, text } = doc.data();
    return { id: doc.id, userId, username, createDatetime, type, text };
  });
  return result;
};
