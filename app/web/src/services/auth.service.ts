import api from "@/lib/api";
import type {
  AuthResponse,
  AuthResponseRaw,
  LoginRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RefreshTokenResponseRaw,
  RegisterRequest,
  User,
} from "@/types";

const normalizeAuthResponse = (raw: AuthResponseRaw): AuthResponse => ({
  accessToken: raw.access_token,
  refreshToken: raw.refresh_token,
  user: raw.user,
});

const normalizeRefreshResponse = (
  raw: RefreshTokenResponseRaw
): RefreshTokenResponse => ({
  accessToken: raw.access_token,
  refreshToken: raw.refresh_token,
});

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponseRaw>("/auth/login", data);
    return normalizeAuthResponse(response.data);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponseRaw>("/users", data);
    return normalizeAuthResponse(response.data);
  },

  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponseRaw>(
      "/auth/refresh",
      data
    );
    return normalizeRefreshResponse(response.data);
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/users/me");
    return response.data;
  },

  validateToken: async (token: string): Promise<boolean> => {
    try {
      await api.post("/auth/validate", { token });
      return true;
    } catch {
      return false;
    }
  },
};
