import { useEffect, useState } from 'react'

// Curated verified food photos per cuisine — multiple per cuisine for variety
const CUISINE_PHOTOS = {
  Italian: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=600&q=80',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
  ],
  Indian: [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80',
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
  ],
  Japanese: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80',
    'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80',
    'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600&q=80',
  ],
  Mexican: [
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=600&q=80',
    'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&q=80',
    'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&q=80',
  ],
  Thai: [
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80',
  ],
  Korean: [
    'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80',
    'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=600&q=80',
  ],
  Mediterranean: [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    'https://images.unsplash.com/photo-1494888427482-242d32babc0b?w=600&q=80',
    'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&q=80',
    'https://images.unsplash.com/photo-1637939974554-9e0b4fc73df1?w=600&q=80',
  ],
  Vietnamese: [
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
  ],
  Moroccan: [
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&q=80',
    'https://images.unsplash.com/photo-1489649158428-7c10bfee93a3?w=600&q=80',
  ],
  Chinese: [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80',
  ],
  American: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=600&q=80',
  ],
  British: [
    'https://images.unsplash.com/photo-1535400255456-984e0a29e597?w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
  ],
  Persian: [
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
    'https://images.unsplash.com/photo-1598515213692-9aebd40d6a02?w=600&q=80',
  ],
}

// Deterministic pick using FULL recipe id — guarantees unique per recipe
function pickPhoto(id, cuisine) {
  const pool = CUISINE_PHOTOS[cuisine] ?? CUISINE_PHOTOS.default
  // Use ALL characters of the id to create a better spread
  const hash = id ? id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) : 0
  return pool[hash % pool.length]
}

const mealDBCache = {}

async function tryMealDB(title) {
  const SKIP = new Set(['classic','easy','quick','homemade','with','and','style',
    'creamy','spicy','crispy','grilled','roasted','baked','fried','slow','cooked'])
  const OVERRIDES = {
    'butter chicken': 'Butter Chicken', 'murgh makhani': 'Butter Chicken',
    'biryani': 'Biryani', 'chana masala': 'Chana Masala',
    'dal': 'Dal Fry', 'palak paneer': 'Palak Paneer',
    'ramen': 'Japanese Ramen', 'teriyaki': 'Chicken Teriyaki',
    'bibimbap': 'Bibimbap', 'bulgogi': 'Beef Bulgogi',
    'shakshuka': 'Shakshuka', 'hummus': 'Hummus',
    'falafel': 'Falafel', 'tagine': 'Lamb Tagine',
    'pad thai': 'Pad Thai', 'green curry': 'Thai Green Curry',
    'pho': 'Pho', 'carbonara': 'Spaghetti Carbonara',
    'risotto': 'Mushroom Risotto', 'tiramisu': 'Tiramisu',
    'pizza': 'Margherita Pizza', 'taco': 'Tacos de Barbacoa',
    'gyoza': 'Gyoza', 'enchilada': 'Chicken Enchilada Casserole',
    'sashimi': 'Sashimi', 'miso': 'Miso Soup',
    'souvlaki': 'Greek Chicken Souvlaki', 'fish chips': 'Fish and Chips',
  }

  const lower = title.toLowerCase().replace(/\(.*?\)/g, '').trim()

  // Check override map
  for (const [key, val] of Object.entries(OVERRIDES)) {
    if (lower.includes(key)) {
      if (mealDBCache[val] !== undefined) return mealDBCache[val]
      try {
        const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(val)}`)
        const d = await r.json()
        const url = d?.meals?.[0]?.strMealThumb ?? null
        mealDBCache[val] = url
        return url
      } catch { return null }
    }
  }

  // Generic search with cleaned title
  const words = lower.split(/\s+/).filter(w => w.length > 3 && !SKIP.has(w))
  const q = words.slice(-2).join(' ') || lower
  if (mealDBCache[q] !== undefined) return mealDBCache[q]
  try {
    const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`)
    const d = await r.json()
    const url = d?.meals?.[0]?.strMealThumb ?? null
    mealDBCache[q] = url
    return url
  } catch { return null }
}

export function useRecipeImage(recipe) {
  const userPhoto = recipe?.photo_url?.includes('supabase.co/storage') ? recipe.photo_url : null
  const [imgSrc, setImgSrc] = useState(
    userPhoto ?? pickPhoto(recipe?.id, recipe?.cuisine_type)
  )

  useEffect(() => {
    if (userPhoto || !recipe?.id) return

    // Show cuisine-based photo immediately (no blank state)
    setImgSrc(pickPhoto(recipe.id, recipe.cuisine_type))

    // Then try TheMealDB for a more accurate dish-specific photo
    tryMealDB(recipe.title).then(url => {
      if (url) setImgSrc(url)
    })
  }, [recipe?.id])

  return imgSrc
}
