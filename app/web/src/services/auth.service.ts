import api from '@/lib/api'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from '@/types'

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/users', data)
    return response.data
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', data)
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/users/me')
    return response.data
  },

  validateToken: async (token: string): Promise<boolean> => {
    try {
      await api.post('/auth/validate', { token })
      return true
    } catch {
      return false
    }
  },
}
