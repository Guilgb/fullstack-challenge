import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";
import { TaskPriority, TaskStatus } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  User,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

const priorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: "Baixa",
  [TaskPriority.MEDIUM]: "Média",
  [TaskPriority.HIGH]: "Alta",
  [TaskPriority.URGENT]: "Urgente",
};

const priorityVariants: Record<
  TaskPriority,
  "low" | "medium" | "high" | "urgent"
> = {
  [TaskPriority.LOW]: "low",
  [TaskPriority.MEDIUM]: "medium",
  [TaskPriority.HIGH]: "high",
  [TaskPriority.URGENT]: "urgent",
};

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: "A Fazer",
  [TaskStatus.IN_PROGRESS]: "Em Progresso",
  [TaskStatus.REVIEW]: "Em Revisão",
  [TaskStatus.DONE]: "Concluído",
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-medium line-clamp-1">
            {task.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={priorityVariants[task.priority]}>
              {priorityLabels[task.priority]}
            </Badge>
            {task.status && (
              <Badge variant="outline">{statusLabels[task.status]}</Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/tasks/$taskId" params={{ taskId: task.id }}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalhes
                  </Link>
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(task)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Criado em {formatDate(task.createdAt)}</span>
            </div>
            {task.assignedTo && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Atribuído: {task.assignedTo.slice(0, 8)}...</span>
              </div>
            )}
          </div>
          {task.deadline && (
            <div className="flex items-center gap-1">
              <span>Prazo: {formatDate(task.deadline)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
