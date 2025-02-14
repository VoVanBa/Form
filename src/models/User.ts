import { Business } from './Business';
import { UserOnResponse } from './UserOnResponse';

export class User {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  refreshToken: string;
  formResponses: UserOnResponse[];
  businesses: Business[];

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
}
