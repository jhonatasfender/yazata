const requireEnv = (name: 'VITE_SUPABASE_URL') => {
  const value = import.meta.env[name]

  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }

  return value
}

const getSupabaseClientKey = () => {
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!key) {
    throw new Error(
      'Missing required env var: VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
    )
  }

  return key
}

export const env = {
  supabaseUrl: requireEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: getSupabaseClientKey(),
}
