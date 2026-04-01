import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export type ManagerRow = {
  id: string
  clerk_user_id: string
  company_name: string | null
  settings_json: Record<string, unknown>
  created_at: string
}

export type EmployeeRow = {
  id: string
  manager_id: string
  employee_email: string
  employee_clerk_user_id: string | null
  hourly_rate_cents: number
  status: 'pending' | 'active'
  created_at: string
}

export type TimeEntryRow = {
  id: string
  employee_id: string
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
  manager_id: string
  name: string
  is_active: boolean
  created_by_employee_id: string | null
  created_at: string
}

type ClerkGetToken = (options?: { template?: string }) => Promise<string | null>

export const createClerkSupabaseClient = (getToken: ClerkGetToken) =>
  createClient(env.supabaseUrl, env.supabaseAnonKey, {
    accessToken: async () => {
      try {
        const token = await getToken({ template: 'supabase' })
        return token ?? null
      } catch {
        return null
      }
    },
  })
