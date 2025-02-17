import { Business } from './Business';
import { Role } from './enums/Role';
import { UserOnResponse } from './UserOnResponse';

export class User {
  id: number;
  username: string;
  email: string;
  updatedAt: Date;
  password: string;
  refreshToken: string;
  role: Role;
  googleId?: string;
  businesses: Business[];
  formResponses: UserOnResponse[];

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }

  static fromPrisma(data: any): User {
    if (!data) return null;
    return new User({
      id: data.id,
      username: data.username,
      email: data.email,
      updatedAt: data.updatedAt,
      password: data.password,
      refreshToken: data.refreshToken,
      role: data.role,
      googleId: data.googleId || null,
      businesses: data.businesses
        ? data.businesses.map(Business.fromPrisma)
        : [],
      formResponses: data.formResponses
        ? data.formResponses.map(UserOnResponse.fromPrisma)
        : [],
    });
  }
}
