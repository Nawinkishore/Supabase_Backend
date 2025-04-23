import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Client for client-side operations (if needed)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;