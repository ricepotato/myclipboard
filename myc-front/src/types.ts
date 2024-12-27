import { QuerySnapshot } from "firebase/firestore";

export interface IClipCreate {
  text?: string;
  type: string;
  file?: File;
}

export interface ClipResult {
  clips: IClip[];
  snapshot?: QuerySnapshot;
}

export interface IClip extends IClipCreate {
  id: string;
  userId: string;
  username: string;
  createDatetime: number;
  imageUrl?: string;
}
