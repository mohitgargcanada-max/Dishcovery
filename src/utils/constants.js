export const CUISINES = [
  { label: 'Italian', emoji: '🍝', bg: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80' },
  { label: 'Japanese', emoji: '🍣', bg: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80' },
  { label: 'Mexican', emoji: '🌮', bg: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80' },
  { label: 'Indian', emoji: '🍛', bg: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
  { label: 'Chinese', emoji: '🥡', bg: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' },
  { label: 'Thai', emoji: '🍜', bg: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80' },
  { label: 'French', emoji: '🥐', bg: 'https://images.unsplash.com/photo-1608855238293-a8853e7f7c98?w=400&q=80' },
  { label: 'Mediterranean', emoji: '🫒', bg: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80' },
]

// Multiple images per cuisine for variety — picked by recipe ID hash
export const CUISINE_IMAGES = {
  Italian: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=600&q=80',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80',
    'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80',
  ],
  Japanese: [
    'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80',
    'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80',
  ],
  Mexican: [
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=600&q=80',
    'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=600&q=80',
  ],
  Indian: [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80',
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80',
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
  ],
  Chinese: [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
    'https://images.unsplash.com/photo-1606525437366-81e5f6e94ab9?w=600&q=80',
  ],
  Thai: [
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
    'https://images.unsplash.com/photo-1569562211093-4ed0d0758359?w=600&q=80',
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80',
  ],
  French: [
    'https://images.unsplash.com/photo-1608855238293-a8853e7f7c98?w=600&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  ],
  Mediterranean: [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  ],
  Korean: [
    'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80',
    'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=600&q=80',
  ],
  Vietnamese: [
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80',
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80',
  ],
  Moroccan: [
    'https://images.unsplash.com/photo-1489649158428-7c10bfee93a3?w=600&q=80',
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&q=80',
  ],
  American: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80',
  ],
  British: [
    'https://images.unsplash.com/photo-1535400255456-984e0a29e597?w=600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  ],
}

// Pick a varied image based on recipe id so each card looks different
export function getRecipeImage(recipe) {
  if (recipe.photo_url) return recipe.photo_url
  const pool = CUISINE_IMAGES[recipe.cuisine_type] ?? CUISINE_IMAGES.default
  // Use last char of UUID as index
  const idx = parseInt(recipe.id?.slice(-1) ?? '0', 16) % pool.length
  return pool[idx]
}

export const DIET_TAGS = ['vegan', 'vegetarian', 'keto', 'gluten-free', 'dairy-free', 'halal', 'low-calorie', 'paleo']

export const ALLERGENS = ['nuts', 'dairy', 'gluten', 'eggs', 'soy', 'shellfish', 'fish', 'sesame']

export const DIET_TAG_COLORS = {
  vegan:          'bg-green-900/40 text-green-400 border-green-700/40',
  vegetarian:     'bg-emerald-900/40 text-emerald-400 border-emerald-700/40',
  keto:           'bg-purple-900/40 text-purple-400 border-purple-700/40',
  'gluten-free':  'bg-yellow-900/40 text-yellow-400 border-yellow-700/40',
  'dairy-free':   'bg-blue-900/40 text-blue-400 border-blue-700/40',
  halal:          'bg-teal-900/40 text-teal-400 border-teal-700/40',
  'low-calorie':  'bg-orange-900/40 text-orange-400 border-orange-700/40',
  paleo:          'bg-amber-900/40 text-amber-400 border-amber-700/40',
}
