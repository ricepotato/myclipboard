export interface IClipCreate {
  text?: string;
  type: string;
  file?: File;
}

export interface IClip extends IClipCreate {
  id: string;
  userId: string;
  username: string;
  createDatetime: number;
}
