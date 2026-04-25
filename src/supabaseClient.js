import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mkxsueqbteuvcuaivyfi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1reHN1ZXFidGV1dmN1YWl2eWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Njg5MzQsImV4cCI6MjA5MDQ0NDkzNH0.xWuxmquW2Ll8CU7MtGM3rat4p0sVCkoTzNFijlja_o0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);