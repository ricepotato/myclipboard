import { onAuthStateChanged } from "firebase/auth";
import { DocumentData, QuerySnapshot } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { auth } from "../firebase";
import { onLocalClipsChange } from "../localStore";
import { getClips, listPendingClips, onClipsSynced } from "../repository";
import { IClip } from "../types";

export default function useClip() {
  const [newClip, setNewClip] = useState(false);
  const [pending, setPending] = useState(false);
  // 서버(또는 Firestore 오프라인 캐시)에서 불러온 클립
  const [serverClips, setServerClips] = useState<IClip[]>([]);
  // 브라우저에만 있고 아직 서버에 올라가지 않은 클립
  const [localClips, setLocalClips] = useState<IClip[]>([]);

  const snapshotRef = useRef<QuerySnapshot<DocumentData, DocumentData>>();
  const objectUrlsRef = useRef<string[]>([]);

  const getClipsData = useCallback(async () => {
    setPending(true);
    setNewClip(true);
    try {
      const result = await getClips();
      snapshotRef.current = result.snapshot;
      setServerClips(result.clips.reverse());
    } catch (e) {
      // 오프라인이고 캐시도 없으면 실패할 수 있음. 로컬 클립은 계속 보여줌
      console.error(e);
      snapshotRef.current = undefined;
      setServerClips([]);
    } finally {
      setPending(false);
    }
  }, []);

  const getClipsMore = useCallback(async () => {
    if (snapshotRef.current === undefined) {
      return;
    }
    setPending(true);
    setNewClip(false);
    try {
      const result = await getClips(10, snapshotRef.current);
      snapshotRef.current = result.snapshot;
      setServerClips((prev) => [...result.clips.reverse(), ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setPending(false);
    }
  }, []);

  const loadLocalClips = useCallback(async () => {
    const records = await listPendingClips();
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    setLocalClips(
      records.map((record) => {
        let imageUrl: string | undefined;
        if (record.file) {
          imageUrl = URL.createObjectURL(record.file);
          objectUrlsRef.current.push(imageUrl);
        }
        return {
          id: record.id,
          userId: record.ownerUid ?? "",
          username: "",
          createDatetime: record.createDatetime,
          type: record.type,
          text: record.text,
          imageUrl,
          pending: true,
        };
      })
    );
  }, []);

  // 로그인/로그아웃 시 목록을 다시 불러옴 (최초 1회 호출도 여기서 처리)
  useEffect(() => {
    return onAuthStateChanged(auth, () => {
      getClipsData();
      loadLocalClips();
    });
  }, [getClipsData, loadLocalClips]);

  useEffect(() => onLocalClipsChange(loadLocalClips), [loadLocalClips]);

  // 동기화로 서버에 올라간 클립은 서버 목록에 추가 (로컬 목록에서는 change 이벤트로 빠짐)
  useEffect(
    () =>
      onClipsSynced((synced) => {
        setServerClips((prev) => {
          const ids = new Set(prev.map((clip) => clip.id));
          return [...prev, ...synced.filter((clip) => !ids.has(clip.id))];
        });
      }),
    []
  );

  useEffect(
    () => () => objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)),
    []
  );

  // 같은 id가 양쪽에 있으면(업로드 직후 등) 로컬 쪽을 우선. 오래된 것부터 정렬
  const clips = useMemo(() => {
    const localIds = new Set(localClips.map((clip) => clip.id));
    return [...serverClips.filter((clip) => !localIds.has(clip.id)), ...localClips].sort(
      (a, b) => (a.createDatetime ?? 0) - (b.createDatetime ?? 0)
    );
  }, [serverClips, localClips]);

  const removeClip = useCallback((id: string) => {
    setServerClips((prev) => prev.filter((clip) => clip.id !== id));
    setLocalClips((prev) => prev.filter((clip) => clip.id !== id));
  }, []);

  return { clips, removeClip, pending, newClip, getClipsData, getClipsMore };
}
