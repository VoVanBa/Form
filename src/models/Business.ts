export class Business {
  id: number;

  name: string;

  createdAt: Date;

  updatedAt: Date;

  address: string;

  userId: number;

  constructor(data: Partial<Business>) {
    Object.assign(this, data);
  }
}
