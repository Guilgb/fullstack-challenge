import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth'
import type { LoginRequest, RegisterRequest } from '@/types'
import { toast } from '@/hooks/use-toast'
import { useNavigate } from '@tanstack/react-router'

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast({
        title: 'Login realizado',
        description: `Bem-vindo, ${data.user.username || data.user.email}!`,
        variant: 'success',
      })
      navigate({ to: '/tasks' })
    },
    onError: () => {
      toast({
        title: 'Erro no login',
        description: 'E-mail ou senha inválidos.',
        variant: 'destructive',
      })
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast({
        title: 'Conta criada',
        description: 'Sua conta foi criada com sucesso!',
        variant: 'success',
      })
      navigate({ to: '/tasks' })
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Não foi possível criar sua conta.'
      toast({
        title: 'Erro no cadastro',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  return () => {
    logout()
    toast({
      title: 'Logout',
      description: 'Você foi desconectado.',
    })
    navigate({ to: '/login' })
  }
}
