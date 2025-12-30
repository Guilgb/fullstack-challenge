import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoardCard } from "@/components/boards/board-card";
import { renderWithProviders } from "@/test/test-utils";
import type { Board } from "@/types";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

describe("BoardCard", () => {
  const mockBoard: Board = {
    id: "1",
    name: "Test Board",
    description: "Test Description",
    ownerId: "user1",
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
    members: [
      {
        id: "member1",
        userId: "user1",
        boardId: "1",
        role: "owner",
        user: {
          id: "user1",
          email: "user1@example.com",
          name: "User One",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render board card with basic information", () => {
    renderWithProviders(<BoardCard board={mockBoard} />);

    expect(screen.getByText("Test Board")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // member count
  });

  it("should render member count", () => {
    renderWithProviders(<BoardCard board={mockBoard} />);

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("should show zero members when no members array", () => {
    const boardWithoutMembers = { ...mockBoard, members: undefined };
    renderWithProviders(<BoardCard board={boardWithoutMembers} />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should call onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <BoardCard board={mockBoard} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const menuButton = screen.getByRole("button", { name: "" });
    await user.click(menuButton);

    const editButton = screen.getByText(/editar/i);
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockBoard);
  });

  it("should call onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <BoardCard board={mockBoard} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const menuButton = screen.getByRole("button", { name: "" });
    await user.click(menuButton);

    const deleteButton = screen.getByText(/excluir/i);
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockBoard);
  });

  it("should not render edit button when onEdit is not provided", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BoardCard board={mockBoard} onDelete={mockOnDelete} />);

    const menuButton = screen.getByRole("button", { name: "" });
    await user.click(menuButton);

    expect(screen.queryByText(/editar/i)).not.toBeInTheDocument();
  });

  it("should not render delete button when onDelete is not provided", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BoardCard board={mockBoard} onEdit={mockOnEdit} />);

    const menuButton = screen.getByRole("button", { name: "" });
    await user.click(menuButton);

    expect(screen.queryByText(/excluir/i)).not.toBeInTheDocument();
  });

  it("should have link to board details", () => {
    renderWithProviders(<BoardCard board={mockBoard} />);

    const detailsLink = screen.getByText(/ver detalhes/i).closest("a");
    expect(detailsLink).toHaveAttribute("href", "/boards/$boardId");
  });

  it("should format date correctly", () => {
    renderWithProviders(<BoardCard board={mockBoard} />);

    // Check if date is displayed in some format
    expect(screen.getByText(/criado em/i)).toBeInTheDocument();
  });
});
