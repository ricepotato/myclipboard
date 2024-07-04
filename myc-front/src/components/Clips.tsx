import { deleteClip } from "../repository";
import { IClip } from "../types";
import { Button } from "./ui/button";

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
        <li className="flex p-2" key={`${clip.id}`}>
          {clip.type.includes("image") && clip.imageUrl ? (
            <div>
              <div>
                <img src={clip.imageUrl} alt={clip.text} className="h-24" />
              </div>
              <div>
                <Button>Copy</Button>
              </div>
            </div>
          ) : null}
          <div>
            <code>{clip.text}</code>
            <div className="flex gap-1">
              {clip.type.includes("text") ? (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(clip.text as string);
                  }}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  copy
                </button>
              ) : (
                <Button
                  onClick={() => {
                    window.open(clip.imageUrl, "_blank");
                  }}
                >
                  Download
                </Button>
              )}
              <Button
                onClick={() => {
                  deleteClip(clip.id);
                  onDelete(clip.id);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
