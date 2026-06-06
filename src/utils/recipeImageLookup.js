import { CUISINE_PHOTOS } from './cuisinePhotos'

const MEAL_OVERRIDES = {
  'butter chicken': 'Butter Chicken', 'murgh makhani': 'Butter Chicken',
  'biryani': 'Biryani', 'chana masala': 'Chana Masala',
  'dal': 'Dal Fry', 'palak paneer': 'Palak Paneer',
  'ramen': 'Japanese Ramen', 'teriyaki': 'Chicken Teriyaki',
  'bibimbap': 'Bibimbap', 'bulgogi': 'Beef Bulgogi',
  'shakshuka': 'Shakshuka', 'hummus': 'Hummus', 'falafel': 'Falafel',
  'tagine': 'Lamb Tagine', 'pad thai': 'Pad Thai',
  'green curry': 'Thai Green Curry', 'pho': 'Pho',
  'carbonara': 'Spaghetti Carbonara', 'risotto': 'Mushroom Risotto',
  'tiramisu': 'Tiramisu', 'pizza': 'Margherita Pizza',
  'taco': 'Tacos de Barbacoa', 'gyoza': 'Gyoza',
  'enchilada': 'Chicken Enchilada Casserole', 'sashimi': 'Sashimi',
  'miso': 'Miso Soup', 'souvlaki': 'Greek Chicken Souvlaki',
  'fish chips': 'Fish and Chips', 'avocado toast': 'Avocado Toast',
  'guacamole': 'Guacamole', 'quesadilla': 'Quesadillas',
  'stir fry': 'Chicken Stir Fry', 'fried rice': 'Egg Fried Rice',
  'burger': 'Beef Burger', 'soup': 'Lentil Soup',
  'curry': 'Chicken Curry', 'noodle': 'Pad Thai',
  'dumpling': 'Gyoza', 'pancake': 'Pancakes',
}

const SKIP = new Set(['classic','easy','quick','homemade','with','and','style',
  'creamy','spicy','crispy','grilled','roasted','baked','fried','slow','cooked',
  'perfect','ultimate','best','simple','loaded','stuffed'])

/**
 * Looks up the best image URL for a recipe.
 * 1. TheMealDB by title (accurate dish photo)
 * 2. Fallback: cuisine-specific Unsplash photo (varied by recipe id)
 */
export async function lookupRecipeImage(title, cuisine, id) {
  // TheMealDB lookup
  try {
    const lower = title.toLowerCase().replace(/\(.*?\)/g, '').trim()

    // Check override map first
    for (const [key, val] of Object.entries(MEAL_OVERRIDES)) {
      if (lower.includes(key)) {
        const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(val)}`)
        const d = await r.json()
        const url = d?.meals?.[0]?.strMealThumb
        if (url) return url
        break
      }
    }

    // Generic search
    const words = lower.split(/\s+/).filter(w => w.length > 3 && !SKIP.has(w))
    const q = words.slice(-2).join(' ')
    if (q) {
      const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`)
      const d = await r.json()
      const url = d?.meals?.[0]?.strMealThumb
      if (url) return url
    }
  } catch { /* fall through */ }

  // Cuisine-based fallback
  const pool = CUISINE_PHOTOS[cuisine] ?? CUISINE_PHOTOS.default
  const hash = id ? id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 0
  return pool[hash % pool.length]
}
