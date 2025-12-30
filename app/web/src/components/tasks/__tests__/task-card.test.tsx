import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCard } from "@/components/tasks/task-card";
import { renderWithProviders } from "@/test/test-utils";
import type { Task } from "@/types";
import { TaskPriority, TaskStatus } from "@/types";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

describe("TaskCard", () => {
  const mockTask: Task = {
    id: "1",
    title: "Test Task",
    description: "Test Description",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    boardId: "board1",
    assigneeId: null,
    createdById: "user1",
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render task card with basic information", () => {
    renderWithProviders(<TaskCard task={mockTask} />);

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("should display priority badge", () => {
    renderWithProviders(<TaskCard task={mockTask} />);

    expect(screen.getByText("Média")).toBeInTheDocument();
  });

  it("should display status badge", () => {
    renderWithProviders(<TaskCard task={mockTask} />);

    expect(screen.getByText("A Fazer")).toBeInTheDocument();
  });

  it("should display high priority correctly", () => {
    const highPriorityTask = { ...mockTask, priority: TaskPriority.HIGH };
    renderWithProviders(<TaskCard task={highPriorityTask} />);

    expect(screen.getByText("Alta")).toBeInTheDocument();
  });

  it("should display urgent priority correctly", () => {
    const urgentTask = { ...mockTask, priority: TaskPriority.URGENT };
    renderWithProviders(<TaskCard task={urgentTask} />);

    expect(screen.getByText("Urgente")).toBeInTheDocument();
  });

  it("should display in progress status correctly", () => {
    const inProgressTask = { ...mockTask, status: TaskStatus.IN_PROGRESS };
    renderWithProviders(<TaskCard task={inProgressTask} />);

    expect(screen.getByText("Em Progresso")).toBeInTheDocument();
  });

  it("should call onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const menuButton = screen.getByRole("button", { name: "" });
    await user.click(menuButton);

    const editButton = screen.getByText(/editar/i);
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it("should call onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const menuButton = screen.getByRole("button", { name: "" });
    await user.click(menuButton);

    const deleteButton = screen.getByText(/excluir/i);
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTask);
  });

  it("should not render edit button when onEdit is not provided", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskCard task={mockTask} onDelete={mockOnDelete} />);

    const menuButton = screen.getByRole("button", { name: "" });
    await user.click(menuButton);

    expect(screen.queryByText(/editar/i)).not.toBeInTheDocument();
  });

  it("should not render delete button when onDelete is not provided", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskCard task={mockTask} onEdit={mockOnEdit} />);

    const menuButton = screen.getByRole("button", { name: "" });
    await user.click(menuButton);

    expect(screen.queryByText(/excluir/i)).not.toBeInTheDocument();
  });

  it("should have link to task details", () => {
    renderWithProviders(<TaskCard task={mockTask} />);

    const detailsLink = screen.getByText(/ver detalhes/i).closest("a");
    expect(detailsLink).toHaveAttribute("href", "/tasks/$taskId");
  });

  it("should display assignee information when available", () => {
    const taskWithAssignee: Task = {
      ...mockTask,
      assigneeId: "user2",
      assignee: {
        id: "user2",
        email: "assignee@example.com",
        name: "Assignee User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    renderWithProviders(<TaskCard task={taskWithAssignee} />);

    expect(screen.getByText("Assignee User")).toBeInTheDocument();
  });

  it("should show unassigned when no assignee", () => {
    renderWithProviders(<TaskCard task={mockTask} />);

    expect(screen.getByText(/não atribuída/i)).toBeInTheDocument();
  });
});
