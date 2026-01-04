import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fioskggnzgnpqbdjeons.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3NrZ2duemducHFiZGplb25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0OTg5MzksImV4cCI6MjA4MzA3NDkzOX0.cM9zVVpeA0fF4pEDmJrBKCQbiebWIj_u6Q4CNODp6i0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
