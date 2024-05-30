import { IClip } from "../types";

export default function Clips({ clips }: { clips: IClip[] }) {
  return (
    <ul>
      {clips.map((clip) => (
        <li key={`${clip.id}`}>
          {clip.imageUrl ? (
            <div>
              <img src={clip.imageUrl} alt={clip.text} />
            </div>
          ) : null}
          <div>{clip.text}</div>
        </li>
      ))}
    </ul>
  );
}
