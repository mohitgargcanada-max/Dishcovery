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
    url.includes('images.unsplash.com') ||
    url.includes('themealdb.com') ||
    url.includes('www.themealdb.com')
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
      }
    })
  }, [recipe?.id, recipe?.photo_url])

  // Always prefer trusted DB photo over dynamic lookup
  const trusted = isTrusted(recipe?.photo_url) ? recipe.photo_url : null
  return trusted ?? dynamicSrc ?? pickFallback(recipe?.id, recipe?.cuisine_type)
}
