import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://omxmxryetguoptmqardv.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tg39pPEOmdOq90JRQCVBnw_1PGMlIjq'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)