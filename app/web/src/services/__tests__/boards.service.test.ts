import { describe, it, expect, vi, beforeEach } from "vitest";
import { boardsService } from "@/services/boards.service";
import api from "@/lib/api";
import type {
  Board,
  BoardsListResponse,
  CreateBoardRequest,
  UpdateBoardRequest,
  AddMemberRequest,
  BoardMember,
} from "@/types";
import { BoardRole } from "@/types";

vi.mock("@/lib/api");

describe("boardsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should fetch boards list successfully", async () => {
      const mockResponse: BoardsListResponse = {
        data: [
          {
            id: "1",
            name: "Board 1",
            description: "Description 1",
            ownerId: "user1",
            members: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      const result = await boardsService.list();

      expect(api.get).toHaveBeenCalledWith("/boards", { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it("should fetch boards with query params", async () => {
      const params = { page: 2, limit: 20, search: "test" };
      const mockResponse: BoardsListResponse = {
        data: [],
        page: 2,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      await boardsService.list(params);

      expect(api.get).toHaveBeenCalledWith("/boards", { params });
    });
  });

  describe("getById", () => {
    it("should fetch a board by id successfully", async () => {
      const mockBoard: Board = {
        id: "1",
        name: "Test Board",
        description: "Test Description",
        ownerId: "user1",
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockBoard });

      const result = await boardsService.getById("1");

      expect(api.get).toHaveBeenCalledWith("/boards/1");
      expect(result).toEqual(mockBoard);
    });
  });

  describe("create", () => {
    it("should create a board successfully", async () => {
      const createData: CreateBoardRequest = {
        name: "New Board",
        description: "New Description",
      };

      const mockBoard: Board = {
        id: "2",
        name: "New Board",
        description: "New Description",
        ownerId: "user1",
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(api.post).mockResolvedValue({ data: mockBoard });

      const result = await boardsService.create(createData);

      expect(api.post).toHaveBeenCalledWith("/boards", createData);
      expect(result).toEqual(mockBoard);
    });
  });

  describe("update", () => {
    it("should update a board successfully", async () => {
      const updateData: UpdateBoardRequest = {
        name: "Updated Board",
        description: "Updated Description",
      };

      const mockBoard: Board = {
        id: "1",
        name: "Updated Board",
        description: "Updated Description",
        ownerId: "user1",
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(api.put).mockResolvedValue({ data: mockBoard });

      const result = await boardsService.update("1", updateData);

      expect(api.put).toHaveBeenCalledWith("/boards/1", updateData);
      expect(result).toEqual(mockBoard);
    });
  });

  describe("delete", () => {
    it("should delete a board successfully", async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      await boardsService.delete("1");

      expect(api.delete).toHaveBeenCalledWith("/boards/1");
    });
  });

  describe("addMember", () => {
    it("should add a member to board successfully", async () => {
      const addMemberData: AddMemberRequest = {
        userId: "user2",
        role: BoardRole.MEMBER,
      };

      const mockMember: BoardMember = {
        id: "member1",
        userId: "user2",
        username: "memberuser",
        role: BoardRole.MEMBER,
        joinedAt: new Date().toISOString(),
      };

      vi.mocked(api.post).mockResolvedValue({ data: mockMember });

      const result = await boardsService.addMember("board1", addMemberData);

      expect(api.post).toHaveBeenCalledWith(
        "/boards/board1/members",
        addMemberData
      );
      expect(result).toEqual(mockMember);
    });
  });

  describe("removeMember", () => {
    it("should remove a member from board successfully", async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      await boardsService.removeMember("board1", "user2");

      expect(api.delete).toHaveBeenCalledWith("/boards/board1/members/user2");
    });
  });
});
