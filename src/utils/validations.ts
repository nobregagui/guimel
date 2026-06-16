import { z } from 'zod'

export const emailSchema = z.email('E-mail invalido')
export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter no minimo 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter uma letra maiuscula')
  .regex(/[0-9]/, 'A senha deve conter um numero')

export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF invalido')

export const cnpjSchema = z
  .string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ invalido')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha obrigatoria'),
})

export type LoginSchema = z.infer<typeof loginSchema>
