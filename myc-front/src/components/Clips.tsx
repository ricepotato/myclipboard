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
    <div className="my-2 p-4  pb-12 pr-10 min-h-24 relative border w-full rounded-sm break-words">
      {clip.type.includes("image") && clip.imageUrl ? (
        <img src={clip.imageUrl} alt={clip.text} className="h-24" />
      ) : (
        <ClipCode text={clip.text} />
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
      <div className="absolute left-4 bottom-3 text-slate-600 select-none">
        {formatDate(clip.createDatetime)}
      </div>
    </div>
  );
}

function ClipCode({ text }: { text: string | undefined }) {
  /** code 내에 html 링크가 있으면 <a> 를 붙임
   */
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  if (text === undefined) {
    return null;
  }
  const parts = text.split(urlRegex);
  const content = parts.map((part, idx) => {
    if (part.match(urlRegex)) {
      return (
        <a
          href={part}
          key={idx}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 hover:underline"
        >
          {part}
        </a>
      );
    } else {
      return part;
    }
  });

  return <code>{content}</code>;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
