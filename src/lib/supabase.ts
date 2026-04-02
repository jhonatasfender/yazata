import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export type UserRow = {
  id: string
  clerk_user_id: string
  primary_email: string | null
  created_at: string
  updated_at: string
}

export type CompanyRow = {
  id: string
  legal_name: string
  trade_name: string | null
  created_at: string
  updated_at: string
}

export type ManagerProfileRow = {
  id: string
  user_id: string
  company_id: string
  settings_json: Record<string, unknown>
  created_at: string
}

export type EmploymentContractRow = {
  id: string
  manager_profile_id: string
  company_tax_profile_id: string | null
  employee_user_id: string | null
  employee_email: string
  hourly_rate_cents: number
  status: 'pending' | 'active' | 'inactive'
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export type ManagerRow = ManagerProfileRow & {
  company_name: string
  company_legal_name: string
  company_trade_name: string | null
}

export type EmployeeRow = EmploymentContractRow & {
  company_id: string
}

export type TimeEntryRow = {
  id: string
  employment_contract_id: string
  project_id: string | null
  work_date: string
  start_time: string
  end_time: string
  worked_hours: number
  hourly_rate_cents_snapshot: number
  gross_amount_cents: number
  description: string | null
  created_at: string
}

export type ProjectRow = {
  id: string
  company_id: string
  created_by_contract_id: string | null
  name: string
  is_active: boolean
  created_at: string
}

type ClerkGetToken = (options?: { template?: string }) => Promise<string | null>

export const createClerkSupabaseClient = (getToken: ClerkGetToken) =>
  createClient(env.supabaseUrl, env.supabaseAnonKey, {
    accessToken: async () => {
      try {
        const fromTemplate = await getToken({ template: 'supabase' })
        if (fromTemplate) return fromTemplate
        return (await getToken()) ?? null
      } catch {
        return null
      }
    },
  })
