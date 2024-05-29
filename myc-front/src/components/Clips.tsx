import { IClip } from "../types";

export default function Clips({ clips }: { clips: IClip[] }) {
  return (
    <ul>
      {clips.map((clip) => (
        <li key={`${clip.id}`}>{`${clip.username} : ${clip.text}`}</li>
      ))}
    </ul>
  );
}
