import { Role } from '@prisma/client';
import { IBusiness } from './Business';
import { IUserOnResponse } from './UserOnResponse';

export interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
  refreshToken: string;
  role: Role;
  googleId?: string;
  businesses: IBusiness[];
  formResponses: IUserOnResponse[];
}
