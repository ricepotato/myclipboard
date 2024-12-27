import { MdDeleteOutline } from "react-icons/md";
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
    <div className="my-2 p-4 pr-10 min-h-24 relative border w-full rounded-sm break-words cursor-pointer">
      {clip.type.includes("image") && clip.imageUrl ? (
        <img src={clip.imageUrl} alt={clip.text} className="h-24" />
      ) : (
        <code>{clip.text}</code>
      )}
      <div className="absolute top-2 right-2 flex flex-col gap-2 items-center">
        <CopyCheckButton
          onClick={() => {
            if (clip.type.includes("text")) {
              navigator.clipboard.writeText(clip.text as string);
            } else {
              window.open(clip.imageUrl, "_blank");
            }
          }}
        ></CopyCheckButton>
        <MdDeleteOutline
          className="cursor-pointer size-6"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this clip?")) {
              deleteClip(clip.id);
              onDelete(clip.id);
            }
          }}
        />
      </div>
    </div>
  );
}
