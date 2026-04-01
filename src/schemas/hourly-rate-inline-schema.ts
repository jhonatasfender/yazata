import { z } from 'zod'

export const hourlyRateInlineSchema = z.object({
  hourlyRate: z.string().min(1, 'Informe o novo valor/hora'),
})

export type HourlyRateInlineFormValues = z.infer<typeof hourlyRateInlineSchema>
