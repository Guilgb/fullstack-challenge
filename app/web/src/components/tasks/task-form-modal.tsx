import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/hooks/use-boards";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { taskSchema, type TaskFormData } from "@/schemas";
import { TaskPriority, TaskStatus, type BoardMember, type Task } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  boardId?: string;
}

const priorityOptions = [
  { value: TaskPriority.LOW, label: "Baixa" },
  { value: TaskPriority.MEDIUM, label: "Média" },
  { value: TaskPriority.HIGH, label: "Alta" },
  { value: TaskPriority.URGENT, label: "Urgente" },
];

const statusOptions = [
  { value: TaskStatus.TODO, label: "A Fazer" },
  { value: TaskStatus.IN_PROGRESS, label: "Em Progresso" },
  { value: TaskStatus.REVIEW, label: "Em Revisão" },
  { value: TaskStatus.DONE, label: "Concluído" },
];

export function TaskFormModal({
  open,
  onOpenChange,
  task,
  boardId,
}: TaskFormModalProps) {
  const isEditing = !!task;

  // Buscar dados do board para obter membros
  const { data: board } = useBoard(boardId || "");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      deadline: null,
      assignedTo: null,
    },
  });

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status || TaskStatus.TODO,
        deadline: task.deadline ? task.deadline.split("T")[0] : null,
        assignedTo: task.assignedTo || null,
      });
    } else {
      reset({
        title: "",
        description: "",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        deadline: null,
        assignedTo: null,
      });
    }
  }, [task, reset]);

  const onSubmit = (data: TaskFormData) => {
    const payload = {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      status: data.status,
      deadline: data.deadline
        ? new Date(data.deadline).toISOString()
        : undefined,
      boardId: boardId || undefined,
      assignedTo: data.assignedTo || undefined,
    };

    if (isEditing && task) {
      updateMutation.mutate(
        { id: task.id, data: payload },
        {
          onSuccess: () => {
            onOpenChange(false);
            reset();
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          reset();
        },
      });
    }
  };

  // Obter lista de membros do board
  const members: BoardMember[] = board?.members || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Digite o título da tarefa"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a tarefa..."
              rows={4}
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo</Label>
            <Input id="deadline" type="date" {...register("deadline")} />
          </div>

          {boardId && members.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Atribuir a</Label>
              <Controller
                name="assignedTo"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "unassigned" ? null : value)
                    }
                    value={field.value || "unassigned"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um membro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <span className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          Não atribuído
                        </span>
                      </SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Usuário {member.username.slice(0, 8)}...
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Salvando..." : "Criando..."}
                </>
              ) : isEditing ? (
                "Salvar"
              ) : (
                "Criar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
