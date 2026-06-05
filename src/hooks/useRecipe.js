import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useRecipe(id) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select(`*, profiles(id, username, full_name, avatar_url)`)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}
