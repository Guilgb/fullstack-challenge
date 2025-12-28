import { TaskDetailSkeleton } from "@/components/tasks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useTask } from "@/hooks/use-tasks";
import { toast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import { commentSchema, type CommentFormData } from "@/schemas";
import { useAuthStore } from "@/store/auth";
import { TaskPriority } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  Send,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

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

const mockComments = [
  {
    id: "1",
    content: "Comecei a trabalhar nesta tarefa.",
    userId: "1",
    userName: "João Silva",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    content: "Preciso de mais informações sobre o escopo.",
    userId: "2",
    userName: "Maria Santos",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

export function TaskDetailPage() {
  const { taskId } = useParams({ from: "/tasks/$taskId" });
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const { data: task, isLoading, isError, error } = useTask(taskId);
  const [comments, setComments] = useState(mockComments);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmitComment = (data: CommentFormData) => {
    const newComment = {
      id: String(Date.now()),
      content: data.content,
      userId: user?.id || "1",
      userName: user?.username || "Usuário",
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
    reset();
    toast({
      title: "Comentário adicionado",
      description: "Seu comentário foi adicionado com sucesso.",
      variant: "success",
    });
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <TaskDetailSkeleton />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Erro ao carregar tarefa</h3>
          <p className="text-muted-foreground mb-4">
            {(error as Error)?.message || "Tarefa não encontrada"}
          </p>
          <Link to="/tasks">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para tarefas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tasks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant={priorityVariants[task.priority]}>
              {priorityLabels[task.priority]}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Criada em {formatDateTime(task.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Descrição</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {task.description || "Sem descrição."}
          </p>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Prazo:</span>
              <span>
                {task.deadline ? formatDateTime(task.deadline) : "Não definido"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Última atualização:</span>
              <span>{formatDateTime(task.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <CardTitle className="text-lg">
            Comentários ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[300px] pr-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {comment.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.userName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <Separator />

          <form onSubmit={handleSubmit(onSubmitComment)} className="space-y-3">
            <Textarea
              placeholder="Escreva um comentário..."
              {...register("content")}
              className={errors.content ? "border-destructive" : ""}
            />
            {errors.content && (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}
            <div className="flex justify-end">
              <Button type="submit" className="gap-2">
                <Send className="h-4 w-4" />
                Enviar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
