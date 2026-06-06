import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useProfile(usernameOrId) {
  return useQuery({
    queryKey: ['profile', usernameOrId],
    queryFn: async () => {
      // Try by username first
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', usernameOrId)
        .maybeSingle()
      if (data) return data

      // Fall back to UUID lookup
      const { data: byId, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', usernameOrId)
        .maybeSingle()
      if (error) throw error
      if (!byId) throw new Error('User not found')
      return byId
    },
    enabled: !!usernameOrId,
  })
}

export function useProfileRecipes(userId) {
  return useQuery({
    queryKey: ['profile-recipes', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!userId,
  })
}

export function useFollowCounts(userId) {
  return useQuery({
    queryKey: ['follow-counts', userId],
    queryFn: async () => {
      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
      ])
      return { followers, following }
    },
    enabled: !!userId,
  })
}
