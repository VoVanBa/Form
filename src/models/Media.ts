export class Media {
  id: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Media>) {
    Object.assign(this, data);
  }
}
