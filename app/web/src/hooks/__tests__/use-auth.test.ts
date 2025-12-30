import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";
import { createWrapper } from "@/test/test-utils";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types";

vi.mock("@/services/auth.service");
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
  });

  it("should login successfully and update auth store", async () => {
    const mockResponse: AuthResponse = {
      user: {
        id: "1",
        email: "test@example.com",
        username: "testuser",
        role: "user",
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: "access-token",
      refreshToken: "refresh-token",
    };

    vi.mocked(authService.login).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    const loginData: LoginRequest = {
      email: "test@example.com",
      password: "password123",
    };

    result.current.mutate(loginData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authService.login).toHaveBeenCalledWith(loginData);
    
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockResponse.user);
    expect(state.accessToken).toBe("access-token");
    expect(state.refreshToken).toBe("refresh-token");
  });

  it("should handle login error", async () => {
    const error = new Error("Invalid credentials");
    vi.mocked(authService.login).mockRejectedValue(error);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    const loginData: LoginRequest = {
      email: "test@example.com",
      password: "wrong-password",
    };

    result.current.mutate(loginData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});

describe("useRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
  });

  it("should register successfully and update auth store", async () => {
    const mockResponse: AuthResponse = {
      user: {
        id: "2",
        email: "newuser@example.com",
        username: "newuser",
        role: "user",
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: "access-token",
      refreshToken: "refresh-token",
    };

    vi.mocked(authService.register).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    const registerData: RegisterRequest = {
      email: "newuser@example.com",
      password: "password123",
      username: "newuser",
    };

    result.current.mutate(registerData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authService.register).toHaveBeenCalledWith(registerData);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockResponse.user);
    expect(state.accessToken).toBe("access-token");
    expect(state.refreshToken).toBe("refresh-token");
  });

  it("should handle registration error", async () => {
    const error = new Error("Email already exists");
    vi.mocked(authService.register).mockRejectedValue(error);

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    const registerData: RegisterRequest = {
      email: "existing@example.com",
      password: "password123",
      username: "existinguser",
    };

    result.current.mutate(registerData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});
