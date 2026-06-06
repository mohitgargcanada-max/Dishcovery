const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const unsplashKey = (Deno.env.get('UNSPLASH_ACCESS_KEY') || Deno.env.get('UNSPLASH_ACCESS_KEY '))?.trim()
    if (!unsplashKey) {
      return new Response(JSON.stringify({ url: null, error: 'UNSPLASH_ACCESS_KEY not set' }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    const { title, cuisine } = await req.json()

    // Strip adjectives, keep core dish keywords for better Unsplash results
    const SKIP = new Set(['zesty','classic','easy','quick','crispy','creamy','spicy','grilled',
      'roasted','baked','fried','slow','cooked','homemade','simple','perfect','ultimate',
      'best','loaded','stuffed','smoky','tangy','sweet','savory','hearty','fresh',
      'lemon','garlic','herb','butter','honey','pepper','chili','ginger','lime','citrus'])
    const coreWords = title.split(/\s+/)
      .filter(w => w.length > 2 && !SKIP.has(w.toLowerCase()))
      .slice(-3).join(' ')
    const searchTitle = coreWords || title.split(' ').slice(-2).join(' ')
    const query = encodeURIComponent(`${searchTitle} ${cuisine || ''} food`.trim())

    const r = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&content_filter=high`,
      { headers: { 'Authorization': `Client-ID ${unsplashKey}` } }
    )

    if (!r.ok) {
      return new Response(JSON.stringify({ url: null }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    const data = await r.json()
    const url = data?.urls?.regular ?? null

    return new Response(JSON.stringify({ url }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ url: null, error: String(e) }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
  }
})
