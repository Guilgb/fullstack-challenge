import type { Board } from "@/types";
import { BoardCard } from "./board-card";

interface BoardListProps {
  boards: Board[];
  onEdit?: (board: Board) => void;
  onDelete?: (board: Board) => void;
}

export function BoardList({ boards, onEdit, onDelete }: BoardListProps) {
  if (boards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum board encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <BoardCard
          key={board.id}
          board={board}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
