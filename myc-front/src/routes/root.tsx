import { LoadMoreButton } from "@/components/buttons";
import { useEffect, useRef } from "react";
import Clips from "../components/Clips";
import { ClipboardForm } from "../components/form";
import useClip from "../hooks/useClip";
import { addClip } from "../repository";
import Header from "../components/Header";
import { auth } from "../firebase";
import { IClip } from "../types";

export default function Root() {
  const mainRef = useRef<HTMLDivElement>(null);
  const { clips, setClips, pending, newClip, getClipsData, getClipsMore } =
    useClip();

  useEffect(() => {
    if (newClip) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [newClip, clips]);

  const onSubmit = async (data: FormData) => {
    const dataText = data.get("data");
    const type = data.get("type");
    const file = data.get("file");
    if (type === null || type === undefined) {
      console.warn("No type");
      return;
    }

    const user = auth.currentUser;
    const tempId = `temp-${Date.now()}`;
    const optimisticClip: IClip = {
      id: tempId,
      userId: user?.uid || "",
      username: user?.displayName || "",
      type: type.toString(),
      text: dataText?.toString() || "",
      pending: true,
    };

    setClips((prev) => [...prev, optimisticClip]);
    window.scrollTo(0, document.body.scrollHeight);

    const result = await addClip({
      text: dataText ? dataText.toString() : undefined,
      type: type.toString(),
      file: file ? (file as File) : undefined,
    });

    if (result) {
      setClips((prev) =>
        prev.map((clip) =>
          clip.id === tempId
            ? { ...clip, id: result.id, createDatetime: result.createDatetime, pending: false }
            : clip
        )
      );
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop } = document.documentElement;
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

  const onDelete = (id: string) => {
    setClips((prev) => prev.filter((clip) => clip.id !== id));
  };

  return (
    <>
      <Header onRefresh={getClipsMore} />
      <main className="h-full pretendard" ref={mainRef}>
        <div className="relative">
          <div className="p-4 pb-20 pt-24">
            <LoadMoreButton
              onClick={() => {
                getClipsMore();
              }}
              pending={pending}
            />

            <Clips clips={clips} onDelete={onDelete} />
          </div>
          <ClipboardForm onSubmit={onSubmit} />
        </div>
      </main>
    </>
  );
}
