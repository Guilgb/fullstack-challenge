import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "@/services/auth.service";
import api from "@/lib/api";
import type {
  AuthResponseRaw,
  LoginRequest,
  RefreshTokenResponseRaw,
  RegisterRequest,
  User,
} from "@/types";

vi.mock("@/lib/api");

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should login successfully and normalize response", async () => {
      const loginData: LoginRequest = {
        email: "test@example.com",
        password: "password123",
      };

      const mockResponse: AuthResponseRaw = {
        access_token: "access-token",
        refresh_token: "refresh-token",
        token_type: "bearer",
        expires_in: 3600,
        user: {
          id: "1",
          email: "test@example.com",
          username: "testuser",
          role: "user",
          isEmailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await authService.login(loginData);

      expect(api.post).toHaveBeenCalledWith("/auth/login", loginData);
      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: mockResponse.user,
      });
    });

    it("should handle login error", async () => {
      const loginData: LoginRequest = {
        email: "test@example.com",
        password: "wrong-password",
      };

      const error = new Error("Invalid credentials");
      vi.mocked(api.post).mockRejectedValue(error);

      await expect(authService.login(loginData)).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("register", () => {
    it("should register successfully and normalize response", async () => {
      const registerData: RegisterRequest = {
        email: "newuser@example.com",
        password: "password123",
        username: "newuser",
      };

      const mockResponse: AuthResponseRaw = {
        access_token: "access-token",
        refresh_token: "refresh-token",
        token_type: "bearer",
        expires_in: 3600,
        user: {
          id: "2",
          email: "newuser@example.com",
          username: "newuser",
          role: "user",
          isEmailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await authService.register(registerData);

      expect(api.post).toHaveBeenCalledWith("/users", registerData);
      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: mockResponse.user,
      });
    });

    it("should handle registration error", async () => {
      const registerData: RegisterRequest = {
        email: "existing@example.com",
        password: "password123",
        username: "existinguser",
      };

      const error = new Error("Email already exists");
      vi.mocked(api.post).mockRejectedValue(error);

      await expect(authService.register(registerData)).rejects.toThrow(
        "Email already exists"
      );
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully and normalize response", async () => {
      const refreshData = {
        refresh_token: "old-refresh-token",
      };

      const mockResponse: RefreshTokenResponseRaw = {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      };

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await authService.refreshToken(refreshData);

      expect(api.post).toHaveBeenCalledWith("/auth/refresh", refreshData);
      expect(result).toEqual({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });
    });

    it("should handle refresh token error", async () => {
      const refreshData = {
        refresh_token: "invalid-token",
      };

      const error = new Error("Invalid refresh token");
      vi.mocked(api.post).mockRejectedValue(error);

      await expect(authService.refreshToken(refreshData)).rejects.toThrow(
        "Invalid refresh token"
      );
    });
  });

  describe("getMe", () => {
    it("should fetch user profile successfully", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        username: "testuser",
        role: "user",
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockUser });

      const result = await authService.getMe();

      expect(api.get).toHaveBeenCalledWith("/users/me");
      expect(result).toEqual(mockUser);
    });

    it("should handle getMe error", async () => {
      const error = new Error("Unauthorized");
      vi.mocked(api.get).mockRejectedValue(error);

      await expect(authService.getMe()).rejects.toThrow("Unauthorized");
    });
  });
});
