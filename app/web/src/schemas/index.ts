import { TaskPriority } from "@/types";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Nome de usuário deve ter no mínimo 3 caracteres")
      .max(50, "Nome de usuário deve ter no máximo 50 caracteres"),
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Senha deve conter: maiúscula, minúscula, número e caractere especial"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  description: z
    .string()
    .max(2000, "Descrição deve ter no máximo 2000 caracteres"),
  priority: z.enum([
    TaskPriority.LOW,
    TaskPriority.MEDIUM,
    TaskPriority.HIGH,
    TaskPriority.URGENT,
  ]),
  deadline: z.string().nullable(),
  assignedTo: z.string().uuid().nullable().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comentário é obrigatório")
    .max(1000, "Comentário deve ter no máximo 1000 caracteres"),
});

export type CommentFormData = z.infer<typeof commentSchema>;

export const boardSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  description: z
    .string()
    .max(2000, "Descrição deve ter no máximo 2000 caracteres")
    .optional(),
});

export type BoardFormData = z.infer<typeof boardSchema>;
