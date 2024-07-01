import { deleteClip } from "../repository";
import { IClip } from "../types";

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
                <button>copy</button>
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
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  download
                </button>
              )}
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  deleteClip(clip.id);
                  onDelete(clip.id);
                }}
              >
                delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
