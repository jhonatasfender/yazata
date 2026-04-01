import { z } from 'zod'

export const timeEntrySchema = z
  .object({
    workDate: z.string().min(1, 'Informe a data'),
    startTime: z.string().min(1, 'Informe o horário inicial'),
    endTime: z.string().min(1, 'Informe o horário final'),
    description: z.string(),
    projectId: z.string().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'Horário final deve ser maior que o inicial',
    path: ['endTime'],
  })

export type TimeEntryFormValues = z.infer<typeof timeEntrySchema>
