import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function useSupabase() {
  if (!_client) {
    const config = useRuntimeConfig()
    _client = createClient(config.public.supabaseUrl, config.public.supabaseKey)
  }
  return _client
}
