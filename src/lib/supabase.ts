import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') {
  console.warn('[IdeaForge] 未配置 Supabase，云同步功能不可用。请在 .env.local 中填写 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。')
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder')

export const isSupabaseConfigured = () =>
  !!supabaseUrl &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !!supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key-here'
