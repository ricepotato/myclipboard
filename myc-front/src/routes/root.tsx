import { LoadMoreButton, RefreshCheckButton } from "@/components/buttons";
import { debounce } from "es-toolkit";
import { DocumentData, QuerySnapshot } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [newClip, setNewClip] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchClipsData();
  }, []);

  useEffect(() => {
    if (newClip) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [clips, newClip]);

  useEffect(() => {
    const handleScroll = () => {
      console.log("scrolling");
      const { scrollTop, offsetHeight } = document.documentElement;
      console.log(scrollTop);
      // if (window.innerHeight + scrollTop >= offsetHeight) {
      //   console.log("fetching more");
      // }
      if (scrollTop <= 500) {
        //console.log("fetching more");
        //fetchClipsDataMore();
      }
    };
    console.log("adding event listener");
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchClipsData = async () => {
    const result = await getClips();
    snapshotRef.current = result.snapshot;
    setClips(result.clips.reverse());
    setNewClip(true);
  };

  const cachedFetchClipsMore = useCallback(async () => {
    if (snapshotRef.current === undefined) {
      return;
    }
    const result = await getClips(10, snapshotRef.current);
    snapshotRef.current = result.snapshot;
    setClips((prev) => [...result.clips.reverse(), ...prev]);
    setNewClip(false);
    setFetching(false);
  }, []);

  const fetchClipsDataMore = debounce(cachedFetchClipsMore, 1500);

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
            <LoadMoreButton
              onClick={() => {
                setFetching(true);
                fetchClipsDataMore();
              }}
              pending={fetching}
            />

            <Clips clips={clips} onDelete={onDelete} />
          </div>
          <ClipboardForm onSubmit={onSubmit} />
        </div>
      </main>
    </>
  );
}
