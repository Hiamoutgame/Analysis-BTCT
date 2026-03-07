export interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  type?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export interface AuthUser {
  user_id: number;
  email: string;
  full_name: string | null;
  role: "user" | "admin";
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_expires_at: string;
  refresh_expires_at: string;
  user: AuthUser;
}

export interface ForgotPasswordResponse {
  message: string;
  reset_token?: string | null;
}
