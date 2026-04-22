import { z } from 'zod'

export const teamInviteSchema = z.object({
  email: z.string().email('E-mail inválido'),
  displayName: z
    .string()
    .max(120, 'No máximo 120 caracteres')
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  hourlyRate: z
    .string()
    .min(1, 'Informe o valor/hora')
    .refine((value) => !Number.isNaN(Number(value.replace(',', '.'))), {
      message: 'Valor/hora inválido',
    }),
})

export type TeamInviteFormValues = z.infer<typeof teamInviteSchema>
