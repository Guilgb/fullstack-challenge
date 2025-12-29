import { toast } from "@/hooks/use-toast";
import { boardsService } from "@/services/boards.service";
import type {
  AddMemberRequest,
  BoardRole,
  BoardsQueryParams,
  CreateBoardRequest,
  UpdateBoardRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const boardKeys = {
  all: ["boards"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  list: (params: BoardsQueryParams) => [...boardKeys.lists(), params] as const,
  details: () => [...boardKeys.all, "detail"] as const,
  detail: (id: string) => [...boardKeys.details(), id] as const,
};

export function useBoards(params?: BoardsQueryParams) {
  return useQuery({
    queryKey: boardKeys.list(params ?? {}),
    queryFn: () => boardsService.list(params),
  });
}

export function useBoard(id: string) {
  return useQuery({
    queryKey: boardKeys.detail(id),
    queryFn: () => boardsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoardRequest) => boardsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      toast({
        title: "Board criado",
        description: "O board foi criado com sucesso.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o board.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBoardRequest }) =>
      boardsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(variables.id),
      });
      toast({
        title: "Board atualizado",
        description: "O board foi atualizado com sucesso.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o board.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => boardsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      toast({
        title: "Board excluído",
        description: "O board foi excluído com sucesso.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o board.",
        variant: "destructive",
      });
    },
  });
}

// Member management hooks
export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      data,
    }: {
      boardId: string;
      data: AddMemberRequest;
    }) => boardsService.addMember(boardId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(variables.boardId),
      });
      toast({
        title: "Membro adicionado",
        description: "O membro foi adicionado ao board com sucesso.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro.",
        variant: "destructive",
      });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, userId }: { boardId: string; userId: string }) =>
      boardsService.removeMember(boardId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(variables.boardId),
      });
      toast({
        title: "Membro removido",
        description: "O membro foi removido do board com sucesso.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      userId,
      role,
    }: {
      boardId: string;
      userId: string;
      role: BoardRole;
    }) => boardsService.updateMemberRole(boardId, userId, { role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(variables.boardId),
      });
      toast({
        title: "Função atualizada",
        description: "A função do membro foi atualizada com sucesso.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a função do membro.",
        variant: "destructive",
      });
    },
  });
}
