import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mkxsueqbteuvcuaivyfi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1reHN1ZXFidGV1dmN1YWl2eWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Njg5MzQsImV4cCI6MjA5MDQ0NDkzNH0.xWuxmquW2Ll8CU7MtGM3rat4p0sVCkoTzNFijlja_o0';

if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
    console.warn('Supabase is using the hardcoded fallback config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseConfig = { url: supabaseUrl };
