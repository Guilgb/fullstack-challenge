import { describe, it, expect, vi, beforeEach } from "vitest";
import { tasksService } from "@/services/tasks.service";
import api from "@/lib/api";
import { TaskPriority, TaskStatus } from "@/types";
import type {
  Task,
  TasksListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TasksQueryParams,
} from "@/types";

vi.mock("@/lib/api");

describe("tasksService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should fetch tasks list successfully", async () => {
      const mockResponse: TasksListResponse = {
        data: [
          {
            id: "1",
            title: "Task 1",
            description: "Description 1",
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            deadline: null,
            boardId: "board1",
            assignedTo: undefined,
            createdBy: "user1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      const result = await tasksService.list();

      expect(api.get).toHaveBeenCalledWith("/tasks", { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it("should fetch tasks for a specific board", async () => {
      const params: TasksQueryParams = { boardId: "board1" };
      const mockResponse: TasksListResponse = {
        data: [],
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      await tasksService.list(params);

      expect(api.get).toHaveBeenCalledWith("/boards/board1/tasks", {
        params: {},
      });
    });

    it("should fetch tasks with filters", async () => {
      const params: TasksQueryParams = {
        page: 2,
        pageSize: 20,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
      };
      const mockResponse: TasksListResponse = {
        data: [],
        page: 2,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      await tasksService.list(params);

      expect(api.get).toHaveBeenCalledWith("/tasks", { params });
    });
  });

  describe("getById", () => {
    it("should fetch a task by id successfully", async () => {
      const mockTask: Task = {
        id: "1",
        title: "Test Task",
        description: "Test Description",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        deadline: null,
        boardId: "board1",
        assignedTo: undefined,
        createdBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockTask });

      const result = await tasksService.getById("1");

      expect(api.get).toHaveBeenCalledWith("/tasks/1");
      expect(result).toEqual(mockTask);
    });
  });

  describe("create", () => {
    it("should create a task successfully", async () => {
      const createData: CreateTaskRequest = {
        title: "New Task",
        description: "New Description",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        boardId: "board1",
      };

      const mockTask: Task = {
        id: "2",
        title: "New Task",
        description: "New Description",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        deadline: null,
        boardId: "board1",
        assignedTo: undefined,
        createdBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(api.post).mockResolvedValue({ data: mockTask });

      const result = await tasksService.create(createData);

      expect(api.post).toHaveBeenCalledWith("/tasks", createData);
      expect(result).toEqual(mockTask);
    });
  });

  describe("update", () => {
    it("should update a task successfully", async () => {
      const updateData: UpdateTaskRequest = {
        title: "Updated Task",
        status: TaskStatus.IN_PROGRESS,
      };

      const mockTask: Task = {
        id: "1",
        title: "Updated Task",
        description: "Description",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        deadline: null,
        boardId: "board1",
        assignedTo: undefined,
        createdBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(api.put).mockResolvedValue({ data: mockTask });

      const result = await tasksService.update("1", updateData);

      expect(api.put).toHaveBeenCalledWith("/tasks/1", updateData);
      expect(result).toEqual(mockTask);
    });
  });

  describe("delete", () => {
    it("should delete a task successfully", async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      await tasksService.delete("1");

      expect(api.delete).toHaveBeenCalledWith("/tasks/1");
    });
  });
});
