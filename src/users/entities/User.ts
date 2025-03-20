import { Business } from 'src/business/entities/Business';
import { UserOnResponse } from 'src/models/UserOnResponse';
import { Role } from './enums/Role';

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

  constructor(data: any) {
    this.id = data.id ?? 0;
    this.username = data.username ?? '';
    this.email = data.email ?? '';
    this.updatedAt = data.updatedAt ?? new Date();
    this.password = data.password ?? '';
    this.refreshToken = data.refreshToken ?? '';
    this.role = data.role ?? Role.CUSTOMER;
    this.googleId = data.googleId ?? undefined;
    this.businesses = Array.isArray(data.businesses)
      ? data.businesses.map((b) => new Business(b))
      : [];
    this.formResponses = Array.isArray(data.formResponses)
      ? data.formResponses.map((r) => new UserOnResponse(r))
      : [];
  }
}
