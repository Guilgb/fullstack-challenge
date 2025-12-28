import api from '@/lib/api'
import type {
  Task,
  TasksListResponse,
  TasksQueryParams,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@/types'

export const tasksService = {
  list: async (params?: TasksQueryParams): Promise<TasksListResponse> => {
    const response = await api.get<TasksListResponse>('/tasks', { params })
    return response.data
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`)
    return response.data
  },

  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data)
    return response.data
  },

  update: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },
}
