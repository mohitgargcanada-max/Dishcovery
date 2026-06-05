import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useSavedRecipes(userId) {
  return useQuery({
    queryKey: ['saves', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_saves')
        .select(`*, recipes(*, profiles(id, username, full_name, avatar_url))`)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!userId,
  })
}

export function useSaveRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, recipeId, isFavourite = false }) => {
      const { data: existing } = await supabase
        .from('user_saves')
        .select('id')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .single()

      if (existing) {
        await supabase.from('user_saves').delete().eq('id', existing.id)
        return { saved: false }
      } else {
        await supabase.from('user_saves').insert({ user_id: userId, recipe_id: recipeId, is_favourite: isFavourite })
        return { saved: true }
      }
    },
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['saves', userId] })
    },
  })
}

export function useCookedThis() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, recipeId }) => {
      const { data: existing } = await supabase
        .from('cooked_this')
        .select('id')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .single()

      if (!existing) {
        await supabase.from('cooked_this').insert({ user_id: userId, recipe_id: recipeId })
        await supabase.rpc('increment_cooked', { recipe_id: recipeId }).catch(() => null)
      }
      return { cooked: !existing }
    },
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['saves', userId] })
    },
  })
}

export function useSaveStatus(userId, recipeId) {
  return useQuery({
    queryKey: ['save-status', userId, recipeId],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_saves')
        .select('id, is_favourite')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .single()
      return data
    },
    enabled: !!(userId && recipeId),
  })
}
