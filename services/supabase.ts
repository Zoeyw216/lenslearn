
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lxlzjjdmvjkqjkiuomfl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY;

// 使用环境变量
const actualUrl = supabaseUrl;
const actualKey = supabaseAnonKey;

export const supabase = createClient(actualUrl, actualKey);
