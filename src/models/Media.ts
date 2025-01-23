export class Media {
  id: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    url: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.url = url;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}