import { z } from 'zod'

export const employeeSelfDisplayNameSchema = z.object({
  displayName: z
    .string()
    .max(120, 'No máximo 120 caracteres')
    .transform((value) => (value?.trim() ? value.trim() : '')),
})

export type EmployeeSelfDisplayNameFormValues = z.infer<
  typeof employeeSelfDisplayNameSchema
>
