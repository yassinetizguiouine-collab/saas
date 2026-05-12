import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nckptaxuekxkpxnuzrfb.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ja3B0YXh1ZWt4a3B4bnV6cmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTA1MzksImV4cCI6MjA5NDE4NjUzOX0.D3yIsq736CHop2LUZm-UAW_hiOJbHDPTkrihrgjHwzo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
