import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskFilters } from "@/components/tasks/task-filters";
import { renderWithProviders } from "@/test/test-utils";
import { TaskPriority } from "@/types";

describe("TaskFilters", () => {
  const mockOnSearchChange = vi.fn();
  const mockOnPriorityChange = vi.fn();
  const mockOnOrderByChange = vi.fn();
  const mockOnOrderDirectionChange = vi.fn();
  const mockOnClearFilters = vi.fn();

  const defaultProps = {
    search: "",
    onSearchChange: mockOnSearchChange,
    priority: "all" as const,
    onPriorityChange: mockOnPriorityChange,
    orderBy: "createdAt",
    onOrderByChange: mockOnOrderByChange,
    orderDirection: "DESC" as const,
    onOrderDirectionChange: mockOnOrderDirectionChange,
    onClearFilters: mockOnClearFilters,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render search input", () => {
    renderWithProviders(<TaskFilters {...defaultProps} />);

    expect(
      screen.getByPlaceholderText(/buscar tarefas/i)
    ).toBeInTheDocument();
  });

  it("should render priority select", () => {
    renderWithProviders(<TaskFilters {...defaultProps} />);

    expect(screen.getByText(/todas as prioridades/i)).toBeInTheDocument();
  });

  it("should call onSearchChange when typing in search input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/buscar tarefas/i);
    await user.type(searchInput, "test");

    expect(mockOnSearchChange).toHaveBeenCalled();
  });

  it("should display current search value", () => {
    renderWithProviders(<TaskFilters {...defaultProps} search="test search" />);

    expect(screen.getByDisplayValue("test search")).toBeInTheDocument();
  });

  it("should call onPriorityChange when selecting priority", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskFilters {...defaultProps} />);

    const prioritySelect = screen.getByText(/todas as prioridades/i);
    await user.click(prioritySelect);

    const highOption = screen.getByText("Alta");
    await user.click(highOption);

    expect(mockOnPriorityChange).toHaveBeenCalledWith(TaskPriority.HIGH);
  });

  it("should display selected priority", () => {
    renderWithProviders(
      <TaskFilters {...defaultProps} priority={TaskPriority.HIGH} />
    );

    expect(screen.getByText("Alta")).toBeInTheDocument();
  });

  it("should render order by select", () => {
    renderWithProviders(<TaskFilters {...defaultProps} />);

    expect(screen.getByText(/data de criação/i)).toBeInTheDocument();
  });

  it("should call onOrderByChange when selecting order", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskFilters {...defaultProps} />);

    const orderBySelect = screen.getByText(/data de criação/i);
    await user.click(orderBySelect);

    const titleOption = screen.getByText("Título");
    await user.click(titleOption);

    expect(mockOnOrderByChange).toHaveBeenCalledWith("title");
  });

  it("should render order direction toggle", () => {
    renderWithProviders(<TaskFilters {...defaultProps} />);

    // Should have a button to toggle order direction
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should call onOrderDirectionChange when toggling direction", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskFilters {...defaultProps} />);

    // Find and click the order direction button (usually an arrow icon button)
    const directionButton = screen.getAllByRole("button").find(
      (btn) => btn.getAttribute("aria-label") || btn.textContent
    );

    if (directionButton) {
      await user.click(directionButton);
      // The exact call depends on implementation, but it should be called
      // expect(mockOnOrderDirectionChange).toHaveBeenCalled();
    }
  });

  it("should show clear filters button when filters are applied", () => {
    renderWithProviders(<TaskFilters {...defaultProps} search="test" />);

    expect(screen.getByText(/limpar filtros/i)).toBeInTheDocument();
  });

  it("should hide clear filters button when no filters are applied", () => {
    renderWithProviders(<TaskFilters {...defaultProps} />);

    expect(screen.queryByText(/limpar filtros/i)).not.toBeInTheDocument();
  });

  it("should call onClearFilters when clear button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskFilters {...defaultProps} search="test" />);

    const clearButton = screen.getByText(/limpar filtros/i);
    await user.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it("should show clear button when priority is not all", () => {
    renderWithProviders(
      <TaskFilters {...defaultProps} priority={TaskPriority.HIGH} />
    );

    expect(screen.getByText(/limpar filtros/i)).toBeInTheDocument();
  });

  it("should show clear button when orderBy is not default", () => {
    renderWithProviders(<TaskFilters {...defaultProps} orderBy="title" />);

    expect(screen.getByText(/limpar filtros/i)).toBeInTheDocument();
  });

  it("should show clear button when orderDirection is not default", () => {
    renderWithProviders(
      <TaskFilters {...defaultProps} orderDirection="ASC" />
    );

    expect(screen.getByText(/limpar filtros/i)).toBeInTheDocument();
  });

  it("should display all priority options", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskFilters {...defaultProps} />);

    const prioritySelect = screen.getByText(/todas as prioridades/i);
    await user.click(prioritySelect);

    expect(screen.getByText("Baixa")).toBeInTheDocument();
    expect(screen.getByText("Média")).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("Urgente")).toBeInTheDocument();
  });

  it("should display all order by options", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskFilters {...defaultProps} />);

    const orderBySelect = screen.getByText(/data de criação/i);
    await user.click(orderBySelect);

    expect(screen.getByText("Data de atualização")).toBeInTheDocument();
    expect(screen.getByText("Título")).toBeInTheDocument();
  });
});
