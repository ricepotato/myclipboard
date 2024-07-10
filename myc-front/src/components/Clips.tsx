import { MdDeleteOutline, MdOutlineDownloading } from "react-icons/md";
import { deleteClip } from "../repository";
import { IClip } from "../types";
import { CopyCheckButton } from "./buttons";

export default function Clips({
  clips,
  onDelete,
}: {
  clips: IClip[];
  onDelete: (id: string) => void;
}) {
  return (
    <ul>
      {clips.map((clip) => (
        <li key={`${clip.id}`}>
          <Clip clip={clip} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}

function Clip({
  clip,
  onDelete,
}: {
  clip: IClip;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="my-2 p-4 min-h-24 border flex gap-1 w-full justify-between items-center rounded-sm break-words">
      {clip.type.includes("image") && clip.imageUrl ? (
        <img src={clip.imageUrl} alt={clip.text} className="h-24" />
      ) : (
        <code className="w-full">{clip.text}</code>
      )}
      <div className="flex gap-1">
        {clip.type.includes("text") ? (
          <CopyCheckButton
            onClick={() => navigator.clipboard.writeText(clip.text as string)}
          />
        ) : (
          <MdOutlineDownloading
            className="cursor-pointer size-6"
            onClick={() => {
              window.open(clip.imageUrl, "_blank");
            }}
          />
        )}
        <MdDeleteOutline
          className="cursor-pointer size-6"
          onClick={() => {
            deleteClip(clip.id);
            onDelete(clip.id);
          }}
        />
      </div>
    </div>
  );
}
