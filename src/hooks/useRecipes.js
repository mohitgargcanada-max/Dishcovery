import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const PAGE_SIZE = 12

export function useRecipes(tab = 'trending', tasteProfile = null) {
  return useInfiniteQuery({
    queryKey: ['recipes', tab, tasteProfile],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('recipes')
        .select(`*, profiles(id, username, full_name, avatar_url)`)
        .eq('is_published', true)
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1)

      if (tab === 'trending') {
        query = query.order('save_count', { ascending: false })
      } else if (tab === 'foryou' && tasteProfile?.cuisines?.length) {
        query = query.in('cuisine_type', tasteProfile.cuisines).order('created_at', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    staleTime: 5 * 60 * 1000,
  })
}
