import clsx from "clsx";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const editable = !clip.type.includes("image");

  const handleClick = () => {
    // 텍스트를 드래그해 선택한 경우엔 수정 화면으로 이동하지 않음
    if (!editable || window.getSelection()?.toString()) return;
    navigate(`/edit/${clip.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        "my-2 p-4  pb-12 pr-10 min-h-24 relative border w-full rounded-sm break-words",
        editable && "cursor-pointer hover:bg-slate-800/50 transition-colors"
      )}
    >
      {clip.type.includes("image") && clip.imageUrl ? (
        <img src={clip.imageUrl} alt={clip.text} className="h-24" />
      ) : (
        <ClipCode text={clip.text} />
      )}
      <div
        className="absolute top-2 right-2 flex flex-col gap-2 items-center"
        onClick={(e) => e.stopPropagation()}
      >
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
        {clip.createDatetime !== undefined ? formatDate(clip.createDatetime) : ""}
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
          onClick={(e) => e.stopPropagation()}
          className="text-orange-400 hover:underline"
        >
          {part}
        </a>
      );
    } else {
      return part;
    }
  });

  return <code className="whitespace-pre-wrap">{content}</code>;
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
