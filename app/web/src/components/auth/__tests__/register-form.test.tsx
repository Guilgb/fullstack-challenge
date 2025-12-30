import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@/components/auth/register-form";
import { renderWithProviders } from "@/test/test-utils";
import { useRegister } from "@/hooks/use-auth";

vi.mock("@/hooks/use-auth");

describe("RegisterForm", () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRegister).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as any);
  });

  it("should render register form fields", () => {
    renderWithProviders(<RegisterForm />);

    expect(screen.getByLabelText(/nome de usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /criar conta/i })
    ).toBeInTheDocument();
  });

  it("should submit form with valid data", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    const usernameInput = screen.getByLabelText(/nome de usuário/i);
    const emailInput = screen.getByLabelText(/^e-mail/i);
    const passwordInput = screen.getByLabelText(/^senha/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
    const submitButton = screen.getByRole("button", { name: /criar conta/i });

    await user.type(usernameInput, "testuser");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      });
    });
  });

  it("should show validation errors for empty fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    const submitButton = screen.getByRole("button", { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0);
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("should show error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    const usernameInput = screen.getByLabelText(/nome de usuário/i);
    const emailInput = screen.getByLabelText(/^e-mail/i);
    const passwordInput = screen.getByLabelText(/^senha/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
    const submitButton = screen.getByRole("button", { name: /criar conta/i });

    await user.type(usernameInput, "testuser");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "differentpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords.*match/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("should disable submit button when loading", () => {
    vi.mocked(useRegister).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: false,
      isSuccess: false,
      error: null,
    } as any);

    renderWithProviders(<RegisterForm />);

    const submitButton = screen.getByRole("button");
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/criando/i)).toBeInTheDocument();
  });

  it("should show validation error for invalid email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    const emailInput = screen.getByLabelText(/^e-mail/i);
    const submitButton = screen.getByRole("button", { name: /criar conta/i });

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("should show validation error for short password", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^senha/i);
    const submitButton = screen.getByRole("button", { name: /criar conta/i });

    await user.type(passwordInput, "123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/at least/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
