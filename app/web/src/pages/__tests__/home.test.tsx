import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomePage } from "@/pages/home";
import { renderWithProviders } from "@/test/test-utils";
import { useAuthStore } from "@/store/auth";

vi.mock("@/components/auth", () => ({
  AuthModal: ({ open, onOpenChange }: any) => (
    <div>
      Auth Modal {open ? "Open" : "Closed"}
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  ),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  });

  it("should render home page with main heading", () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getByText(/gerencie suas tarefas com/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/facilidade/i)).toBeInTheDocument();
  });

  it("should display app description", () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getByText(/o taskmanager ajuda você a organizar/i)
    ).toBeInTheDocument();
  });

  it("should show 'começar agora' button when not authenticated", () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText(/começar agora/i)).toBeInTheDocument();
  });

  it("should show 'ver minhas tarefas' button when authenticated", () => {
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

    renderWithProviders(<HomePage />);

    expect(screen.getByText(/ver minhas tarefas/i)).toBeInTheDocument();
  });

  it("should open auth modal when clicking 'começar agora'", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    const startButton = screen.getByText(/começar agora/i);
    await user.click(startButton);

    expect(screen.getByText(/auth modal open/i)).toBeInTheDocument();
  });

  it("should have link to tasks page when authenticated", () => {
    useAuthStore.setState({
      user: {
        id: "1",
        email: "test@example.com",
        username: "testuser",
        role: "user",
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: "token",
      refreshToken: "refresh",
    });

    renderWithProviders(<HomePage />);

    const tasksLink = screen.getByText(/ver minhas tarefas/i).closest("a");
    expect(tasksLink).toHaveAttribute("href", "/tasks");
  });

  it("should display feature icons", () => {
    renderWithProviders(<HomePage />);

    // Check if the main heading exists
    const heading = screen.getByText(/gerencie suas tarefas com/i);
    const container = heading.closest("div.text-center");
    expect(container).toBeInTheDocument();
  });

  it("should display app icon", () => {
    renderWithProviders(<HomePage />);

    const heading = screen.getByText(/gerencie suas tarefas com/i);
    const container = heading.closest("div.text-center");
    expect(container).toBeInTheDocument();
  });

  it("should close auth modal when close is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    const startButton = screen.getByText(/começar agora/i);
    await user.click(startButton);

    expect(screen.getByText(/auth modal open/i)).toBeInTheDocument();

    const closeButton = screen.getByText(/close/i);
    await user.click(closeButton);

    expect(screen.getByText(/auth modal closed/i)).toBeInTheDocument();
  });
});
