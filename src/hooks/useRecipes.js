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
        // Strict diet filtering — each of user's diets must appear in recipe tags
        if (tasteProfile?.diets?.length) {
          for (const diet of tasteProfile.diets) {
            query = query.contains('ai_diet_tags', [diet])
          }
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
