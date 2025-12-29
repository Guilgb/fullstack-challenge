import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteBoard } from "@/hooks/use-boards";
import type { Board } from "@/types";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board | null;
}

export function DeleteBoardModal({
  open,
  onOpenChange,
  board,
}: DeleteBoardModalProps) {
  const deleteMutation = useDeleteBoard();

  const handleDelete = () => {
    if (!board) return;

    deleteMutation.mutate(board.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Excluir Board</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Tem certeza que deseja excluir o board "{board?.name}"? Todas as
            tarefas associadas também serão excluídas. Esta ação não pode ser
            desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
