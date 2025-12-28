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

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  deadline: string | null;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
  assignedTo?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
}

export interface TasksListResponse {
  tasks: Task[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TasksQueryParams {
  page?: number;
  pageSize?: number;
  orderBy?: "title" | "description" | "createdAt" | "updatedAt";
  orderDirection?: "ASC" | "DESC";
  search?: string;
  priority?: TaskPriority;
}

// Comment Types
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

// Pagination Types
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

// WebSocket Types
export interface WebSocketNotification {
  type: "task_created" | "task_updated" | "task_deleted" | "comment_added";
  data: unknown;
  timestamp: string;
}

// API Error
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
