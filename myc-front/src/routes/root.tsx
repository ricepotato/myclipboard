import { useEffect, useState } from "react";
import Clips from "../components/Clips";
import { ClipboardForm } from "../components/form";
import { addClip, getClips } from "../repository";
import { IClip } from "../types";

export default function Root() {
  const onSubmit = async (data: FormData) => {
    const dataText = data.get("data");
    const type = data.get("type");
    if (type === null || type === undefined) {
      console.warn("No type");
      return;
    }

    await addClip({
      text: dataText ? dataText.toString() : undefined,
      type: type.toString(),
    });

    fetchClipsData();
  };

  const [clips, setClips] = useState<IClip[]>([]);

  useEffect(() => {
    fetchClipsData();
  }, []);

  const fetchClipsData = async () => {
    const result = await getClips();
    setClips(result);
  };
  return (
    <main>
      <div className="p-4">
        <Clips clips={clips} />
        <ClipboardForm onSubmit={onSubmit} />
      </div>
    </main>
  );
}
