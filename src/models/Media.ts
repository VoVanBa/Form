import { Expose } from 'class-transformer';

export class Media {
  id: number;
  @Expose()
  url: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;

  constructor(id: number, url: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.url = url;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
