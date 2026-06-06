import { useEffect, useState } from 'react'
import { CUISINE_PHOTOS } from '../utils/cuisinePhotos'
import { lookupRecipeImage } from '../utils/recipeImageLookup'

function pickFallback(id, cuisine) {
  const pool = CUISINE_PHOTOS[cuisine] ?? CUISINE_PHOTOS.default
  const hash = id ? id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 0
  return pool[hash % pool.length]
}

function isTrusted(url) {
  return !!(url && (
    url.includes('supabase.co/storage') ||
    url.includes('www.themealdb.com') ||
    url.includes('fal.media') ||
    url.includes('fal.run')
  ))
}

const cache = {}

export function useRecipeImage(recipe) {
  const [dynamicSrc, setDynamicSrc] = useState(null)

  useEffect(() => {
    const url = recipe?.photo_url
    if (isTrusted(url) || !recipe?.id || !recipe?.title) return

    const key = recipe.id
    if (cache[key]) { setDynamicSrc(cache[key]); return }

    lookupRecipeImage(recipe.title, recipe.cuisine_type, recipe.id).then(result => {
      if (result) {
        cache[key] = result
        setDynamicSrc(result)
        // Persist to DB so it never looks up again
        import('../lib/supabase').then(({ supabase }) => {
          supabase.from('recipes').update({ photo_url: result }).eq('id', recipe.id)
        })
      }
    })
  }, [recipe?.id, recipe?.photo_url])

  // Always prefer trusted DB photo over dynamic lookup
  const trusted = isTrusted(recipe?.photo_url) ? recipe.photo_url : null
  return trusted ?? dynamicSrc ?? pickFallback(recipe?.id, recipe?.cuisine_type)
}
