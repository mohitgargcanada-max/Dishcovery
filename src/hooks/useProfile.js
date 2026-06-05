import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useProfile(username) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!username,
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
