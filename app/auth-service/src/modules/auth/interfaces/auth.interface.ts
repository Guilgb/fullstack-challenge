export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  username: string;
}
