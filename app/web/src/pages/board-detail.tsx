import { AddMemberModal, BoardFormModal } from "@/components/boards";
import { DeleteTaskModal } from "@/components/tasks/delete-task-modal";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBoard, useRemoveMember } from "@/hooks/use-boards";
import { useDeleteTask, useTasks } from "@/hooks/use-tasks";
import { useAuthStore } from "@/store/auth";
import type { BoardMember, Task, TasksQueryParams } from "@/types";
import { BoardRole } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  Plus,
  UserMinus,
  Users,
} from "lucide-react";
import { useState } from "react";

const roleLabels: Record<BoardRole, string> = {
  [BoardRole.OWNER]: "Proprietário",
  [BoardRole.ADMIN]: "Admin",
  [BoardRole.MEMBER]: "Membro",
};

export function BoardDetailPage() {
  const { boardId } = useParams({ from: "/boards/$boardId" });
  const user = useAuthStore((state) => state.user);

  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [taskParams] = useState<TasksQueryParams>({
    page: 1,
    pageSize: 100, // Pegar mais tasks para o Kanban
    boardId,
  });

  const { data: board, isLoading: isBoardLoading } = useBoard(boardId);
  const { data: tasksData, isLoading: isTasksLoading } = useTasks(taskParams);
  const removeMemberMutation = useRemoveMember();
  const deleteTaskMutation = useDeleteTask();

  const isOwner = board?.ownerId === user?.id;
  const currentMember = board?.members?.find((m) => m.userId === user?.id);
  const isAdmin = currentMember?.role === BoardRole.ADMIN;
  const canManageMembers = isOwner || isAdmin;

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteTaskOpen(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsTaskFormOpen(true);
  };

  const handleRemoveMember = (member: BoardMember) => {
    if (
      window.confirm(`Tem certeza que deseja remover este membro do board?`)
    ) {
      removeMemberMutation.mutate({
        boardId,
        userId: member.userId,
      });
    }
  };

  if (isBoardLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-muted-foreground">Board não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/boards">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{board.name}</h1>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditBoardOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
          {board.description && (
            <p className="text-muted-foreground">{board.description}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Members Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membros ({board.members?.length || 0})
              </CardTitle>
              {canManageMembers && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddMemberOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {board.members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {member.username.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[120px]">
                        {member.username}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {roleLabels[member.role]}
                      </Badge>
                    </div>
                  </div>
                  {canManageMembers &&
                    member.role !== BoardRole.OWNER &&
                    member.userId !== user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member)}
                            className="text-destructive focus:text-destructive"
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tarefas</h2>
          <Button onClick={handleCreateTask}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {isTasksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <KanbanBoard
            tasks={tasksData?.data || []}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        )}
      </div>

      {/* Modals */}
      <BoardFormModal
        open={isEditBoardOpen}
        onOpenChange={setIsEditBoardOpen}
        board={board}
      />

      <AddMemberModal
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        boardId={boardId}
      />

      <TaskFormModal
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        task={selectedTask}
        boardId={boardId}
      />

      <DeleteTaskModal
        open={isDeleteTaskOpen}
        onOpenChange={setIsDeleteTaskOpen}
        onConfirm={() => {
          if (selectedTask) {
            deleteTaskMutation.mutate(selectedTask.id, {
              onSuccess: () => {
                setIsDeleteTaskOpen(false);
                setSelectedTask(null);
              },
            });
          }
        }}
        isLoading={deleteTaskMutation.isPending}
        taskTitle={selectedTask?.title}
      />
    </div>
  );
}
