import { z } from 'zod'

export const setupManagerCompanySchema = z.object({
  legalName: z.string().trim().min(2, 'Enter the legal name of your company'),
  tradeName: z.string().trim().optional(),
})

export type SetupManagerCompanyFormValues = z.infer<typeof setupManagerCompanySchema>
