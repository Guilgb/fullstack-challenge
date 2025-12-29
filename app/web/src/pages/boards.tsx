import {
  BoardFormModal,
  BoardList,
  DeleteBoardModal,
} from "@/components/boards";
import { Pagination } from "@/components/tasks/pagination";
import { Button } from "@/components/ui/button";
import { useBoards } from "@/hooks/use-boards";
import type { Board, BoardsQueryParams } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";

export function BoardsPage() {
  const [queryParams, setQueryParams] = useState<BoardsQueryParams>({
    page: 1,
    pageSize: 12,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  const { data, isLoading } = useBoards(queryParams);

  const handleEdit = (board: Board) => {
    setSelectedBoard(board);
    setIsFormOpen(true);
  };

  const handleDelete = (board: Board) => {
    setSelectedBoard(board);
    setIsDeleteOpen(true);
  };

  const handleCreate = () => {
    setSelectedBoard(null);
    setIsFormOpen(true);
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Boards</h1>
          <p className="text-muted-foreground">
            Gerencie seus boards e colabore com sua equipe
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Board
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-lg border bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <BoardList
            boards={data?.data || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {data && data.totalPages > 1 && (
            <Pagination
              page={queryParams.page || 1}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <BoardFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        board={selectedBoard}
      />

      <DeleteBoardModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        board={selectedBoard}
      />
    </div>
  );
}
