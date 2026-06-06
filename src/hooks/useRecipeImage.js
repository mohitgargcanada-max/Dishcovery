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
    url.includes('themealdb.com') ||
    url.includes('images.unsplash.com') ||
    url.includes('plus.unsplash.com') ||
    url.includes('fal.media') ||
    url.includes('fal.run')
  ))
}

export function useRecipeImage(recipe) {
  const [dynamicSrc, setDynamicSrc] = useState(null)

  useEffect(() => {
    // Always clear dynamic src when recipe changes
    setDynamicSrc(null)

    const url = recipe?.photo_url
    if (isTrusted(url) || !recipe?.id || !recipe?.title) return

    // photo_url is null — look up TheMealDB
    lookupRecipeImage(recipe.title, recipe.cuisine_type, recipe.id).then(result => {
      if (result) {
        setDynamicSrc(result)
        // Persist to DB so future loads use trusted URL directly
        import('../lib/supabase').then(({ supabase }) => {
          supabase.from('recipes').update({ photo_url: result }).eq('id', recipe.id)
        })
      }
    })
  }, [recipe?.id, recipe?.photo_url])

  // Trusted DB photo always wins — no cache, always fresh
  const trusted = isTrusted(recipe?.photo_url) ? recipe.photo_url : null
  return trusted ?? dynamicSrc ?? pickFallback(recipe?.id, recipe?.cuisine_type)
}
