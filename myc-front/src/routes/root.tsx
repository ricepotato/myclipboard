import { RefreshCheckButton } from "@/components/buttons";
import { DocumentData, QuerySnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Clips from "../components/Clips";
import { ClipboardForm } from "../components/form";
import { addClip, getClips } from "../repository";
import { IClip } from "../types";

export default function Root() {
  const mainRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<QuerySnapshot<DocumentData, DocumentData>>();
  const onSubmit = async (data: FormData) => {
    const dataText = data.get("data");
    const type = data.get("type");
    const file = data.get("file");
    if (type === null || type === undefined) {
      console.warn("No type");
      return;
    }

    await addClip({
      text: dataText ? dataText.toString() : undefined,
      type: type.toString(),
      file: file ? (file as File) : undefined,
    });

    fetchClipsData();
  };

  const [clips, setClips] = useState<IClip[]>([]);

  useEffect(() => {
    fetchClipsData();
  }, []);

  useEffect(() => {
    //window.scrollTo(0, document.body.scrollHeight);
  }, [clips]);

  const fetchClipsData = async () => {
    const result = await getClips();
    snapshotRef.current = result.snapshot;
    setClips(result.clips.reverse());
  };

  const fetchClipsDataMore = async () => {
    if (snapshotRef.current === undefined) {
      return;
    }

    const result = await getClips(10, snapshotRef.current);
    snapshotRef.current = result.snapshot;
    setClips((prev) => [...result.clips.reverse(), ...prev]);
  };

  const onDelete = (id: string) => {
    setClips((prev) => prev.filter((clip) => clip.id !== id));
  };
  return (
    <>
      <header className="fixed w-full flex items-center justify-between p-4 z-50 bg-gray-900">
        <div>
          <RefreshCheckButton onClick={fetchClipsData} />
        </div>
        <div>
          <Link to="/login">Login</Link>
        </div>
      </header>
      <main className="h-full" ref={mainRef}>
        <div className="relative">
          <div className="p-4 pb-20 pt-16">
            <div>
              <button
                onClick={fetchClipsDataMore}
                className="border w-full rounded-sm py-4 hover:bg-slate-900"
              >
                More
              </button>
            </div>
            <Clips clips={clips} onDelete={onDelete} />
          </div>
          <ClipboardForm onSubmit={onSubmit} />
        </div>
      </main>
    </>
  );
}
