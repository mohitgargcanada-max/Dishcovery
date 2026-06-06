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
    const query = encodeURIComponent(`${title} ${cuisine || ''} food dish`.trim())

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
