import { useEffect, useState } from 'react'

const cache = {}

const SKIP = new Set(['classic','easy','quick','homemade','simple','best','street',
  'style','creamy','spicy','crispy','grilled','roasted','baked','fried','with',
  'and','the','a','an','bowl','wrap','plate','loaded','ultimate','perfect',
  'authentic','traditional','healthy','slow','cooked','pan','seared','stuffed'])

function extractDishName(title) {
  if (!title) return title
  return title.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !SKIP.has(w))
    .join(' ') || title.toLowerCase()
}

// Source 1: TheMealDB - purpose-built food database, free, no key
async function tryMealDB(title) {
  const terms = extractDishName(title).split(' ')
  for (let i = terms.length; i >= 1; i--) {
    const q = terms.slice(-i).join(' ')
    try {
      const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`)
      const d = await r.json()
      if (d?.meals?.[0]?.strMealThumb) return d.meals[0].strMealThumb
    } catch { /* try next */ }
  }
  return null
}

// Source 2: Unsplash Source - search-based, still works, good food photos
function unsplashUrl(title) {
  const term = encodeURIComponent(extractDishName(title) + ' food dish')
  return `https://source.unsplash.com/600x400/?${term}`
}

const FALLBACKS = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
]

export function useRecipeImage(recipe) {
  const userPhoto = recipe?.photo_url?.includes('supabase.co/storage') ? recipe.photo_url : null
  const [imgSrc, setImgSrc] = useState(userPhoto)

  useEffect(() => {
    if (userPhoto || !recipe?.title) return
    const key = recipe.title.toLowerCase()
    if (cache[key]) { setImgSrc(cache[key]); return }

    tryMealDB(recipe.title).then(url => {
      if (url) {
        cache[key] = url
        setImgSrc(url)
      } else {
        // Fallback to Unsplash Source search — returns dish-relevant photo
        const fallback = unsplashUrl(recipe.title)
        cache[key] = fallback
        setImgSrc(fallback)
      }
    })
  }, [recipe?.title])

  if (!imgSrc) {
    const idx = parseInt(recipe?.id?.slice(-1) ?? '0', 16) % FALLBACKS.length
    return FALLBACKS[idx]
  }

  return imgSrc
}
