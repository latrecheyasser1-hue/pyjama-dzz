import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  'https://lneriqvsylwhtywzeyao.supabase.co';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZXJpcXZzeWx3aHR5d3pleWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTE0MTIsImV4cCI6MjEwMTkyNzQxMn0.0_GLOX5ml_GDlHKuisCx9OhbQQFFOvGRwXJvs6iIymE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
