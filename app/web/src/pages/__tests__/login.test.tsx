import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "@/pages/login";
import { renderWithProviders } from "@/test/test-utils";
import { useAuthStore } from "@/store/auth";

vi.mock("@/components/auth", () => ({
  LoginForm: () => <div>Login Form</div>,
  RegisterForm: () => <div>Register Form</div>,
}));

vi.mock("@tanstack/react-router", () => ({
  Navigate: ({ to }: { to: string }) => <div>Navigate to {to}</div>,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  });

  it("should render login page when not authenticated", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/bem-vindo ao taskmanager/i)).toBeInTheDocument();
    expect(
      screen.getByText(/entre ou crie uma conta/i)
    ).toBeInTheDocument();
  });

  it("should render tabs for login and register", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/^entrar$/i)).toBeInTheDocument();
    expect(screen.getByText(/criar conta/i)).toBeInTheDocument();
  });

  it("should display login form by default", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText("Login Form")).toBeInTheDocument();
  });

  it("should show register form when register tab is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const registerTab = screen.getByText(/criar conta/i);
    await user.click(registerTab);

    expect(screen.getByText("Register Form")).toBeInTheDocument();
  });

  it("should redirect to tasks when authenticated", () => {
    useAuthStore.setState({
      user: {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: "token",
      refreshToken: "refresh",
    });

    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/navigate to \/tasks/i)).toBeInTheDocument();
  });

  it("should display app icon", () => {
    renderWithProviders(<LoginPage />);

    const icon = screen.getByText(/bem-vindo/i)
      .closest(".space-y-1")
      ?.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
