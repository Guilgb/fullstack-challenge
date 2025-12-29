import api from "@/lib/api";
import type {
  AddMemberRequest,
  Board,
  BoardMember,
  BoardsListResponse,
  BoardsQueryParams,
  CreateBoardRequest,
  UpdateBoardRequest,
  UpdateMemberRoleRequest,
} from "@/types";

export const boardsService = {
  list: async (params?: BoardsQueryParams): Promise<BoardsListResponse> => {
    const response = await api.get<BoardsListResponse>("/boards", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Board> => {
    const response = await api.get<Board>(`/boards/${id}`);
    return response.data;
  },

  create: async (data: CreateBoardRequest): Promise<Board> => {
    const response = await api.post<Board>("/boards", data);
    return response.data;
  },

  update: async (id: string, data: UpdateBoardRequest): Promise<Board> => {
    const response = await api.put<Board>(`/boards/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },

  addMember: async (
    boardId: string,
    data: AddMemberRequest
  ): Promise<BoardMember> => {
    const response = await api.post<BoardMember>(
      `/boards/${boardId}/members`,
      data
    );
    return response.data;
  },

  removeMember: async (boardId: string, userId: string): Promise<void> => {
    await api.delete(`/boards/${boardId}/members/${userId}`);
  },

  updateMemberRole: async (
    boardId: string,
    userId: string,
    data: UpdateMemberRoleRequest
  ): Promise<BoardMember> => {
    const response = await api.patch<BoardMember>(
      `/boards/${boardId}/members/${userId}/role`,
      data
    );
    return response.data;
  },
};
