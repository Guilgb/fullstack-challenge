import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskPriority } from "@/types";
import { Search, X } from "lucide-react";

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  priority: TaskPriority | "all";
  onPriorityChange: (value: TaskPriority | "all") => void;
  orderBy: string;
  onOrderByChange: (value: string) => void;
  orderDirection: "ASC" | "DESC";
  onOrderDirectionChange: (value: "ASC" | "DESC") => void;
  onClearFilters: () => void;
}

const priorityOptions = [
  { value: "all", label: "Todas as prioridades" },
  { value: TaskPriority.LOW, label: "Baixa" },
  { value: TaskPriority.MEDIUM, label: "Média" },
  { value: TaskPriority.HIGH, label: "Alta" },
  { value: TaskPriority.URGENT, label: "Urgente" },
];

const orderByOptions = [
  { value: "createdAt", label: "Data de criação" },
  { value: "updatedAt", label: "Data de atualização" },
  { value: "title", label: "Título" },
];

export function TaskFilters({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  orderBy,
  onOrderByChange,
  orderDirection,
  onOrderDirectionChange,
  onClearFilters,
}: TaskFiltersProps) {
  const hasFilters =
    search ||
    priority !== "all" ||
    orderBy !== "createdAt" ||
    orderDirection !== "DESC";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={priority}
          onValueChange={(v) => onPriorityChange(v as TaskPriority | "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={orderBy} onValueChange={onOrderByChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            {orderByOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={orderDirection}
          onValueChange={(v) => onOrderDirectionChange(v as "ASC" | "DESC")}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Ordem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DESC">Decrescente</SelectItem>
            <SelectItem value="ASC">Crescente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
