import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wipjjksphouirpvydgnu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcGpqa3NwaG91aXJwdnlkZ251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NTkwODQsImV4cCI6MjEwMDEzNTA4NH0.zqfgPhRq5vz2EVZOmtwYj8AbCI4l8Iwo9AwDsRlpZog'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
