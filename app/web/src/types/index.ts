export interface User {
  id: string;
  email: string;
  username: string;
  role: "admin" | "user";
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponseRaw {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponseRaw {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const TaskPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW: "REVIEW",
  DONE: "DONE",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
  boardId?: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
  boardId?: string;
  assignedTo?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
  assignedTo?: string;
}

export interface TasksListResponse {
  data: Task[];
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

export interface TasksQueryParams {
  page?: number;
  pageSize?: number;
  orderBy?: "title" | "description" | "createdAt" | "updatedAt";
  orderDirection?: "ASC" | "DESC";
  search?: string;
  priority?: TaskPriority;
  boardId?: string;
}

// Board Types
export const BoardRole = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export type BoardRole = (typeof BoardRole)[keyof typeof BoardRole];

export interface BoardMember {
  id: string;
  userId: string;
  username: string;
  role: BoardRole;
  joinedAt: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: BoardMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
}

export interface BoardsListResponse {
  data: Board[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface BoardsQueryParams {
  page?: number;
  pageSize?: number;
}

export interface AddMemberRequest {
  userId: string;
  role?: BoardRole;
}

export interface UpdateMemberRoleRequest {
  role: BoardRole;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  taskId: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface WebSocketNotification {
  type: "task_created" | "task_updated" | "task_deleted" | "comment_added";
  data: unknown;
  timestamp: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
