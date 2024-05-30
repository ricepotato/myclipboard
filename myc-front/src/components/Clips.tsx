import { IClip } from "../types";

export default function Clips({ clips }: { clips: IClip[] }) {
  return (
    <ul>
      {clips.map((clip) => (
        <li key={`${clip.id}`}>
          {clip.imageUrl ? (
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
            <button>copy</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
