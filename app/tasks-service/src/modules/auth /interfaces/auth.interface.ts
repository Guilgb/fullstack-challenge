import { UserRole } from '../enums/roles.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole | string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: UserRole | string;
}
