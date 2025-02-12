export class User {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
}
