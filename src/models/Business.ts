export class Business {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  address: string;
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
