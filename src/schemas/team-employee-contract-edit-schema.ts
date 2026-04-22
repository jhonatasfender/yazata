import { z } from 'zod'

export const teamEmployeeContractEditSchema = z.object({
  displayName: z
    .string()
    .max(120, 'No máximo 120 caracteres')
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : '')),
  hourlyRate: z.string().min(1, 'Informe o novo valor/hora'),
})

export type TeamEmployeeContractEditFormValues = z.infer<
  typeof teamEmployeeContractEditSchema
>
