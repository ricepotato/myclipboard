import { DocumentData, QuerySnapshot } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { getClips } from "../repository";
import { IClip } from "../types";

export default function useClip() {
  const [newClip, setNewClip] = useState(false);
  const [pending, setPending] = useState(false);
  const [clips, setClips] = useState<IClip[]>([]);

  const snapshotRef = useRef<QuerySnapshot<DocumentData, DocumentData>>();

  const getClipsData = useCallback(async () => {
    setPending(true);
    setNewClip(true);
    const result = await getClips();
    snapshotRef.current = result.snapshot;
    setClips(result.clips.reverse());
    setPending(false);
  }, []);

  const getClipsMore = useCallback(async () => {
    if (snapshotRef.current === undefined) {
      return;
    }
    setPending(true);
    setNewClip(false);
    const result = await getClips(10, snapshotRef.current);
    snapshotRef.current = result.snapshot;
    setClips((prev) => [...result.clips.reverse(), ...prev]);
    setPending(false);
  }, []);

  useEffect(() => {
    getClipsData();
  }, [getClipsData]);

  return { clips, setClips, pending, newClip, getClipsData, getClipsMore };
}
