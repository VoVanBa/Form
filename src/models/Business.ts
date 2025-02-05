import { Expose } from 'class-transformer';

export class Business {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
  @Expose()
  address: string;
  @Expose()
  userId: number;

  constructor(
    id: number,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    address: string,
    userId: number,
  ) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.address = address;
    this.userId = userId;
  }
}
