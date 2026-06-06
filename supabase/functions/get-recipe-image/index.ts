const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const unsplashKey = (Deno.env.get('UNSPLASH_ACCESS_KEY') || Deno.env.get('UNSPLASH_ACCESS_KEY '))?.trim()
    const anthropicKey = (Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY '))?.trim()

    if (!unsplashKey) {
      return new Response(JSON.stringify({ url: null, error: 'UNSPLASH_ACCESS_KEY not set' }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    const { title, cuisine } = await req.json()

    // Step 1: Use Claude Haiku to extract core dish name
    let searchTerm = title
    if (anthropicKey) {
      try {
        const claude = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 20,
            system: 'Return 2-3 words suitable for food image search. Focus on protein and cooking method, ignore adjectives and seasonings. Examples: "Grilled Chicken", "Lamb Biryani", "Pasta Carbonara", "Fish Tacos".',
            messages: [{ role: 'user', content: `Food image search term for: "${title}"` }],
          }),
        })
        if (claude.ok) {
          const d = await claude.json()
          const extracted = d.content[0].text.trim()
          if (extracted && extracted.length < 40) searchTerm = extracted
        }
      } catch { /* use original title */ }
    }

    // Step 2: Search Unsplash with clean dish name
    const query = encodeURIComponent(`${searchTerm} ${cuisine || ''} food`.trim())
    const r = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&content_filter=high`,
      { headers: { 'Authorization': `Client-ID ${unsplashKey}` } }
    )

    if (!r.ok) return new Response(JSON.stringify({ url: null }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })

    const data = await r.json()
    return new Response(JSON.stringify({ url: data?.urls?.regular ?? null }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ url: null, error: String(e) }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
  }
})
