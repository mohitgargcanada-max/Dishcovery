import { useEffect, useState } from 'react'
import { CUISINE_PHOTOS } from '../utils/cuisinePhotos'
import { lookupRecipeImage } from '../utils/recipeImageLookup'

function pickFallback(id, cuisine) {
  const pool = CUISINE_PHOTOS[cuisine] ?? CUISINE_PHOTOS.default
  const hash = id ? id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 0
  return pool[hash % pool.length]
}

const cache = {}

export function useRecipeImage(recipe) {
  const url = recipe?.photo_url
  const trusted = url && (
    url.includes('supabase.co/storage') ||
    url.includes('images.unsplash.com') ||
    url.includes('themealdb.com')
  ) ? url : null

  const [imgSrc, setImgSrc] = useState(
    trusted ?? pickFallback(recipe?.id, recipe?.cuisine_type)
  )

  useEffect(() => {
    if (trusted || !recipe?.id || !recipe?.title) return
    const key = recipe.id

    if (cache[key]) { setImgSrc(cache[key]); return }

    // Show cuisine fallback immediately, upgrade when TheMealDB resolves
    const fallback = pickFallback(recipe.id, recipe.cuisine_type)
    setImgSrc(fallback)

    lookupRecipeImage(recipe.title, recipe.cuisine_type, recipe.id).then(url => {
      cache[key] = url
      setImgSrc(url)
    })
  }, [recipe?.id])

  return imgSrc
}
