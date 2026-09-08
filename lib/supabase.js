import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigurationError =
  !supabaseUrl || !supabasePublishableKey
    ? "Supabase is not configured. Add the public URL and publishable key to .env, then restart the development server."
    : null

export const supabase = supabaseConfigurationError
  ? null
  : createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
