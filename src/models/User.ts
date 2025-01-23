export class User {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    username: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}