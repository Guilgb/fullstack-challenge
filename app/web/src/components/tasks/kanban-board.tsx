import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateTask } from "@/hooks/use-tasks";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";
import { TaskPriority, TaskStatus } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  Eye,
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
  User,
} from "lucide-react";

interface KanbanBoardProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

const statusColumns = [
  { status: TaskStatus.TODO, label: "A Fazer", color: "bg-slate-100" },
  {
    status: TaskStatus.IN_PROGRESS,
    label: "Em Progresso",
    color: "bg-blue-50",
  },
  { status: TaskStatus.REVIEW, label: "Em Revisão", color: "bg-yellow-50" },
  { status: TaskStatus.DONE, label: "Concluído", color: "bg-green-50" },
];

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

interface KanbanCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}

function KanbanCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: KanbanCardProps) {
  return (
    <Card className="cursor-grab hover:shadow-md transition-shadow">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <CardTitle className="text-sm font-medium line-clamp-2">
              {task.title}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
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
              {/* Status change options */}
              {statusColumns
                .filter((col) => col.status !== task.status)
                .map((col) => (
                  <DropdownMenuItem
                    key={col.status}
                    onClick={() => onStatusChange(task, col.status)}
                  >
                    Mover para {col.label}
                  </DropdownMenuItem>
                ))}
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
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <Badge variant={priorityVariants[task.priority]} className="text-xs">
            {priorityLabels[task.priority]}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(task.deadline)}
              </span>
            )}
            {task.assignedTo && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KanbanBoard({ tasks, onEdit, onDelete }: KanbanBoardProps) {
  const updateMutation = useUpdateTask();

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    updateMutation.mutate({
      id: task.id,
      data: { status: newStatus },
    });
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusColumns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);
        return (
          <div key={column.status} className={`rounded-lg p-3 ${column.color}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{column.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {columnTasks.length}
              </Badge>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {columnTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Nenhuma tarefa
                </p>
              ) : (
                columnTasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
