const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getUnsplashImage(title: string, unsplashKey: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${title} food dish`)
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

    // Get ALL recipes — replace every image with correct Unsplash photo
    const res = await fetch(
      `${supabaseUrl}/rest/v1/recipes?select=id,title,cuisine_type`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    )
    const recipes = await res.json()

    const results = []
    for (const recipe of recipes) {
      const imgUrl = await getUnsplashImage(recipe.title, unsplashKey)
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
