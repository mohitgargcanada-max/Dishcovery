import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const PAGE_SIZE = 12

export function useRecipes(tab = 'trending', tasteProfile = null, userAllergens = []) {
  return useInfiniteQuery({
    queryKey: ['recipes', tab, tasteProfile, userAllergens],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('recipes')
        .select(`*, profiles(id, username, full_name, avatar_url)`)
        .eq('is_published', true)
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1)

      if (tab === 'trending') {
        query = query.order('save_count', { ascending: false })
      } else if (tab === 'foryou') {
        // Filter by user's preferred cuisines
        if (tasteProfile?.cuisines?.length) {
          query = query.in('cuisine_type', tasteProfile.cuisines)
        }
        // Filter by user's dietary preferences (must match at least one tag)
        if (tasteProfile?.diets?.length) {
          query = query.overlaps('ai_diet_tags', tasteProfile.diets)
        }
        query = query.order('save_count', { ascending: false })
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
