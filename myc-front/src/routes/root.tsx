import { RefreshCheckButton } from "@/components/buttons";
import { useEffect, useRef, useState } from "react";
import Clips from "../components/Clips";
import { ClipboardForm } from "../components/form";
import { addClip, getClips } from "../repository";
import { IClip } from "../types";

export default function Root() {
  const mainRef = useRef<HTMLDivElement>(null);
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
    window.scrollTo(0, document.body.scrollHeight);
  }, [clips]);

  const fetchClipsData = async () => {
    const result = await getClips();
    setClips(result.reverse());

    //mainRef.current?.scrollTo(0, document.body.scrollHeight);
    //mainRef.current?.scrollIntoView({ block: "end", inline: "end" });
    //mainRef.current?.scrollTo(0, -9999);
  };

  const onDelete = (id: string) => {
    setClips((prev) => prev.filter((clip) => clip.id !== id));
  };
  return (
    <main className="h-full" ref={mainRef}>
      <div className="relative">
        <div className="flex justify-end p-4">
          <RefreshCheckButton onClick={fetchClipsData} />
        </div>
        <Clips clips={clips} onDelete={onDelete} />
        <ClipboardForm onSubmit={onSubmit} />
      </div>
    </main>
  );
}
