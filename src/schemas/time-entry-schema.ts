import { z } from 'zod'
import { timeStringToTotalSeconds } from '../utils/time'

export const timeEntrySchema = z
  .object({
    workDate: z.string().min(1, 'Informe a data'),
    startTime: z.string().min(1, 'Informe o horário inicial'),
    endTime: z.string().min(1, 'Informe o horário final'),
    description: z.string(),
    projectId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const startSeconds = timeStringToTotalSeconds(data.startTime)
    const endSeconds = timeStringToTotalSeconds(data.endTime)
    if (startSeconds === null || endSeconds === null) return

    if (endSeconds <= startSeconds) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'O fim deve ser depois do início no mesmo dia.',
        path: ['endTime'],
      })
    }
  })

export type TimeEntryFormValues = z.infer<typeof timeEntrySchema>
