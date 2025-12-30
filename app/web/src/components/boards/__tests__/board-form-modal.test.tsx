import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoardFormModal } from "@/components/boards/board-form-modal";
import { renderWithProviders } from "@/test/test-utils";
import { useCreateBoard, useUpdateBoard } from "@/hooks/use-boards";
import type { Board } from "@/types";

vi.mock("@/hooks/use-boards");

describe("BoardFormModal", () => {
  const mockOnOpenChange = vi.fn();
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCreateBoard).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as any);

    vi.mocked(useUpdateBoard).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as any);
  });

  it("should render create mode when no board is provided", () => {
    renderWithProviders(
      <BoardFormModal open={true} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.getByText(/criar board/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar/i })).toBeInTheDocument();
  });

  it("should render edit mode when board is provided", () => {
    const mockBoard: Board = {
      id: "1",
      name: "Test Board",
      description: "Test Description",
      ownerId: "user1",
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    renderWithProviders(
      <BoardFormModal
        open={true}
        onOpenChange={mockOnOpenChange}
        board={mockBoard}
      />
    );

    expect(screen.getByText(/editar board/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Board")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
  });

  it("should create a new board with valid data", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <BoardFormModal open={true} onOpenChange={mockOnOpenChange} />
    );

    const nameInput = screen.getByLabelText(/nome/i);
    const descriptionInput = screen.getByLabelText(/descrição/i);
    const submitButton = screen.getByRole("button", { name: /criar/i });

    await user.type(nameInput, "New Board");
    await user.type(descriptionInput, "New Description");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        {
          name: "New Board",
          description: "New Description",
        },
        expect.any(Object)
      );
    });
  });

  it("should update an existing board", async () => {
    const user = userEvent.setup();
    const mockBoard: Board = {
      id: "1",
      name: "Test Board",
      description: "Test Description",
      ownerId: "user1",
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    renderWithProviders(
      <BoardFormModal
        open={true}
        onOpenChange={mockOnOpenChange}
        board={mockBoard}
      />
    );

    const nameInput = screen.getByLabelText(/nome/i);
    const submitButton = screen.getByRole("button", { name: /salvar/i });

    await user.clear(nameInput);
    await user.type(nameInput, "Updated Board");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        {
          id: "1",
          data: {
            name: "Updated Board",
            description: "Test Description",
          },
        },
        expect.any(Object)
      );
    });
  });

  it("should show validation error for empty name", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <BoardFormModal open={true} onOpenChange={mockOnOpenChange} />
    );

    const submitButton = screen.getByRole("button", { name: /criar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it("should disable submit button when loading", () => {
    vi.mocked(useCreateBoard).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: true,
      isError: false,
      isSuccess: false,
      error: null,
    } as any);

    renderWithProviders(
      <BoardFormModal open={true} onOpenChange={mockOnOpenChange} />
    );

    const submitButton = screen.getByRole("button", { name: /criando/i });
    expect(submitButton).toBeDisabled();
  });

  it("should reset form when modal is closed", async () => {
    const { rerender } = renderWithProviders(
      <BoardFormModal open={true} onOpenChange={mockOnOpenChange} />
    );

    const nameInput = screen.getByLabelText(/nome/i);
    await userEvent.type(nameInput, "Test Board");

    rerender(
      <BoardFormModal open={false} onOpenChange={mockOnOpenChange} />
    );

    rerender(
      <BoardFormModal open={true} onOpenChange={mockOnOpenChange} />
    );

    // Form should be reset when reopened
    const reopenedNameInput = screen.getByLabelText(/nome/i);
    expect(reopenedNameInput).toHaveValue("");
  });

  it("should call onOpenChange when cancel button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <BoardFormModal open={true} onOpenChange={mockOnOpenChange} />
    );

    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
