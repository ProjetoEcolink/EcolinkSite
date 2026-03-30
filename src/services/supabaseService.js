import { supabase } from '../lib/supabase'

export async function getPoints() {
  const { data, error } = await supabase
    .from('points')
    .select('*')

  if (error) throw error
  return data
}