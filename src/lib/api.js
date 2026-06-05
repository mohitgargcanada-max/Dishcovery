import { supabase } from './supabase'

export async function generateRecipe({ ingredients, dietary, allergens }) {
  const { data, error } = await supabase.functions.invoke('generate-recipe', {
    body: { ingredients, dietary, allergens },
  })
  if (error) throw new Error(data?.error || error.message)
  return data
}

export async function scoreRecipe({ title, ingredients, steps, cuisine }) {
  const { data, error } = await supabase.functions.invoke('score-recipe', {
    body: { title, ingredients, steps, cuisine },
  })
  if (error) throw error
  return data
}

export async function adaptRecipe({ recipe, targetDiet, allergens }) {
  const { data, error } = await supabase.functions.invoke('adapt-recipe', {
    body: { recipe, targetDiet, allergens },
  })
  if (error) throw error
  return data
}

export async function smartSearch({ query, userId }) {
  const { data, error } = await supabase.functions.invoke('smart-search', {
    body: { query, userId },
  })
  if (error) throw error
  return data
}
