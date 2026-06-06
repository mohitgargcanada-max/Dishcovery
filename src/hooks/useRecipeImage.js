import { useEffect, useState } from 'react'

// Extract the core dish name for Wikipedia lookup
// "Classic Lamb Biryani" → "Biryani", "Chicken Teriyaki Bowl" → "Teriyaki"
function getSearchTerm(title) {
  if (!title) return null
  const stop = new Set(['classic','easy','quick','homemade','simple','best',
    'street','style','creamy','spicy','crispy','grilled','roasted','baked','fried',
    'with','and','the','a','an','in','of','bowl','wrap','salad','soup','stew'])
  const words = title.toLowerCase().split(/\s+/).filter(w => !stop.has(w) && w.length > 2)
  // Try last 2 meaningful words first, then just last word
  return words.slice(-2).join(' ') || words[words.length - 1] || title
}

const imageCache = {}

export function useRecipeImage(recipe) {
  const [imgSrc, setImgSrc] = useState(
    recipe?.photo_url?.includes('supabase.co/storage') ? recipe.photo_url : null
  )

  useEffect(() => {
    if (imgSrc) return
    if (!recipe?.title) return

    const term = getSearchTerm(recipe.title)
    if (!term) return

    // Check in-memory cache
    if (imageCache[term]) {
      setImgSrc(imageCache[term])
      return
    }

    // Fetch from Wikipedia Summary API — free, no key required
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`)
      .then(r => r.json())
      .then(data => {
        const url = data?.thumbnail?.source || data?.originalimage?.source
        if (url) {
          // Upscale Wikipedia thumbnails
          const hqUrl = url.replace(/\/\d+px-/, '/600px-')
          imageCache[term] = hqUrl
          setImgSrc(hqUrl)
        }
      })
      .catch(() => null)
  }, [recipe?.title])

  // Fallback: generic food images varied by recipe id
  if (!imgSrc) {
    const fallbacks = [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
      'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&q=80',
    ]
    const idx = parseInt(recipe?.id?.slice(-1) ?? '0', 16) % fallbacks.length
    return fallbacks[idx]
  }

  return imgSrc
}
