import {
  DeleteTaskModal,
  Pagination,
  TaskFilters,
  TaskFormModal,
  TaskList,
  TaskListSkeleton,
} from "@/components/tasks";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useDeleteTask, useTasks } from "@/hooks/use-tasks";
import { useAuthStore } from "@/store/auth";
import type { Task, TaskPriority, TasksQueryParams } from "@/types";
import { Navigate } from "@tanstack/react-router";
import { AlertCircle, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export function TasksPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Filters state
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [orderDirection, setOrderDirection] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Debounce search
  const debouncedSearch = useDebounce(search, 300);

  // Build query params
  const queryParams = useMemo<TasksQueryParams>(
    () => ({
      page,
      pageSize,
      orderBy: orderBy as TasksQueryParams["orderBy"],
      orderDirection,
      ...(priority !== "all" && { priority }),
      ...(debouncedSearch && { search: debouncedSearch }),
    }),
    [page, pageSize, orderBy, orderDirection, priority, debouncedSearch]
  );

  // Fetch tasks
  const { data, isLoading, isError, error } = useTasks(queryParams);
  const deleteMutation = useDeleteTask();

  // Handlers
  const handleEdit = useCallback((task: Task) => {
    setSelectedTask(task);
    setFormModalOpen(true);
  }, []);

  const handleDelete = useCallback((task: Task) => {
    setSelectedTask(task);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (selectedTask) {
      deleteMutation.mutate(selectedTask.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setSelectedTask(null);
        },
      });
    }
  }, [selectedTask, deleteMutation]);

  const handleCreateNew = useCallback(() => {
    setSelectedTask(null);
    setFormModalOpen(true);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setPriority("all");
    setOrderBy("createdAt");
    setOrderDirection("DESC");
    setPage(1);
  }, []);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePriorityChange = (value: TaskPriority | "all") => {
    setPriority(value);
    setPage(1);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Minhas Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas de forma eficiente
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <TaskFilters
        search={search}
        onSearchChange={handleSearchChange}
        priority={priority}
        onPriorityChange={handlePriorityChange}
        orderBy={orderBy}
        onOrderByChange={setOrderBy}
        orderDirection={orderDirection}
        onOrderDirectionChange={setOrderDirection}
        onClearFilters={handleClearFilters}
      />

      {isLoading ? (
        <TaskListSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Erro ao carregar tarefas</h3>
          <p className="text-muted-foreground">
            {(error as Error)?.message || "Ocorreu um erro inesperado"}
          </p>
        </div>
      ) : (
        <>
          <TaskList
            tasks={data?.tasks || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {data && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {data.tasks.length} de {data.total} tarefas
              </p>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <TaskFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        task={selectedTask}
      />

      <DeleteTaskModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        taskTitle={selectedTask?.title}
      />
    </div>
  );
}
