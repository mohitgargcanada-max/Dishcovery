const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function extractDishName(title: string, anthropicKey: string): Promise<string> {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 20,
        system: 'Return only the core dish name, 1-3 words, no punctuation.',
        messages: [{ role: 'user', content: `Extract core dish name: "${title}"` }],
      }),
    })
    if (!r.ok) return title
    const d = await r.json()
    const extracted = d.content[0].text.trim()
    return extracted && extracted.length < 40 ? extracted : title
  } catch { return title }
}

async function getUnsplashImage(title: string, cuisine: string, unsplashKey: string, anthropicKey: string): Promise<string | null> {
  try {
    const dishName = await extractDishName(title, anthropicKey)
    const query = encodeURIComponent(`${dishName} ${cuisine || ''} food`.trim())
    const r = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&content_filter=high`,
      { headers: { 'Authorization': `Client-ID ${unsplashKey}` } }
    )
    if (!r.ok) return null
    const d = await r.json()
    return d?.urls?.regular ?? null
  } catch { return null }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const unsplashKey = (Deno.env.get('UNSPLASH_ACCESS_KEY') || Deno.env.get('UNSPLASH_ACCESS_KEY '))?.trim()

    if (!unsplashKey) {
      return new Response(JSON.stringify({ error: 'UNSPLASH_ACCESS_KEY not set' }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    // Only process recipes with no photo or TheMealDB images (wrong/missing)
    const res = await fetch(
      `${supabaseUrl}/rest/v1/recipes?or=(photo_url.is.null,photo_url.like.*themealdb*)&select=id,title,cuisine_type`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    )
    const recipes = await res.json()

    const anthropicKey = (Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY '))?.trim() ?? ''

    const results = []
    for (const recipe of recipes) {
      const imgUrl = await getUnsplashImage(recipe.title, recipe.cuisine_type, unsplashKey, anthropicKey)
      if (imgUrl) {
        await fetch(`${supabaseUrl}/rest/v1/recipes?id=eq.${recipe.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ photo_url: imgUrl })
        })
        results.push({ title: recipe.title, status: 'updated' })
      } else {
        results.push({ title: recipe.title, status: 'not_found' })
      }
      // Respect Unsplash rate limit (50 req/hour)
      await new Promise(r => setTimeout(r, 1500))
    }

    return new Response(JSON.stringify({ updated: results.filter(r => r.status === 'updated').length, results }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
  }
})
