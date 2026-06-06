const DISH_IMAGES = {
  // Pasta & Italian
  'carbonara':              'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80',
  'spaghetti':              'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80',
  'pizza':                  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
  'margherita':             'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
  'tuscan':                 'https://images.unsplash.com/photo-1598515213692-9aebd40d6a02?w=600&q=80',
  'risotto':                'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80',
  'tiramisu':               'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
  'pasta':                  'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=600&q=80',
  'lasagna':                'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80',
  'gnocchi':                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',

  // Indian
  'biryani':                'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
  'butter chicken':         'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
  'murgh makhani':          'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
  'chana masala':           'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  'chickpea':               'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  'palak paneer':           'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80',
  'paneer':                 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80',
  'dal tadka':              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
  'dal':                    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
  'curry':                  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80',
  'naan':                   'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  'samosa':                 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80',

  // Japanese
  'teriyaki':               'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  'ramen':                  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
  'miso':                   'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
  'sashimi':                'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600&q=80',
  'sushi':                  'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80',
  'tempura':                'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80',
  'gyoza':                  'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80',
  'dumpling':               'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80',
  'udon':                   'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
  'yakitori':               'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',

  // Mexican
  'taco':                   'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
  'guacamole':              'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&q=80',
  'enchilada':              'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=600&q=80',
  'quesadilla':             'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=600&q=80',
  'burrito':                'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80',
  'nachos':                 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=600&q=80',
  'jackfruit':              'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&q=80',
  'salsa':                  'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&q=80',

  // Mediterranean
  'souvlaki':               'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&q=80',
  'shakshuka':              'https://images.unsplash.com/photo-1494888427482-242d32babc0b?w=600&q=80',
  'hummus':                 'https://images.unsplash.com/photo-1637939974554-9e0b4fc73df1?w=600&q=80',
  'falafel':                'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&q=80',
  'tagine':                 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&q=80',
  'kebab':                  'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&q=80',
  'shawarma':               'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&q=80',

  // Fish & Seafood
  'sea bass':               'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
  'salmon':                 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
  'fish and chips':         'https://images.unsplash.com/photo-1535400255456-984e0a29e597?w=600&q=80',
  'fish':                   'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
  'prawn':                  'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&q=80',
  'shrimp':                 'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&q=80',
  'lobster':                'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&q=80',
  'crab':                   'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&q=80',

  // Asian
  'bibimbap':               'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80',
  'bulgogi':                'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=600&q=80',
  'green curry':            'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80',
  'pad thai':               'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
  'pho':                    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80',
  'fried rice':             'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
  'stir fry':               'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
  'stir-fry':               'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
  'noodle':                 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
  'sticky rice':            'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80',
  'mango sticky':           'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80',
  'kimchi':                 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80',

  // Western / American
  'avocado toast':          'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=600&q=80',
  'avocado':                'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=600&q=80',
  'burger':                 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  'steak':                  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
  'soup':                   'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
  'lentil':                 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
  'salad':                  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  'pancake':                'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&q=80',
  'waffle':                 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80',
  'omelette':               'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&q=80',
  'egg':                    'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&q=80',
  'sandwich':               'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80',
  'wrap':                   'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80',
  'roast':                  'https://images.unsplash.com/photo-1598515213692-9aebd40d6a02?w=600&q=80',
  'chicken':                'https://images.unsplash.com/photo-1598515213692-9aebd40d6a02?w=600&q=80',
  'lamb':                   'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
  'beef':                   'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
  'pork':                   'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',

  // Desserts
  'cake':                   'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
  'chocolate':              'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
  'ice cream':              'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80',
  'brownie':                'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
  'cookie':                 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
  'cheesecake':             'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
}

const FALLBACKS = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&q=80',
]

export function getImageByTitle(title) {
  const t = (title || '').toLowerCase()
  for (const [key, url] of Object.entries(DISH_IMAGES)) {
    if (t.includes(key)) return url
  }
  return null
}

export function getRecipeImage(recipe) {
  // Only trust user-uploaded photos stored in Supabase Storage
  if (recipe?.photo_url?.includes('supabase.co/storage')) return recipe.photo_url

  // Use title-based matching for everything else
  const matched = getImageByTitle(recipe?.title)
  if (matched) return matched

  // Final fallback varied by recipe id
  const idx = parseInt(recipe?.id?.slice(-2) ?? '00', 16) % FALLBACKS.length
  return FALLBACKS[idx]
}
