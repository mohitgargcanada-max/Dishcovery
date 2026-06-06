const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = (Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY '))?.trim()
    if (!apiKey) {
      return new Response(JSON.stringify({ keywords: [], diet_tags: [], allergen_free: [], cuisine: null }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    const { query } = await req.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        system: 'Return JSON only. No prose.',
        messages: [{
          role: 'user',
          content: `<query>${query}</query>
<task>Parse this recipe search query into structured filters.</task>
<format>{
  "keywords": string[],
  "max_calories": number|null,
  "max_time": number|null,
  "diet_tags": string[],
  "allergen_free": string[],
  "cuisine": string|null
}</format>`,
        }],
      }),
    })

    const responseText = await response.text()
    if (!response.ok) {
      return new Response(JSON.stringify({ keywords: [query], diet_tags: [], allergen_free: [], cuisine: null }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    const data = JSON.parse(responseText)
    const text = data.content[0].text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    const filters = JSON.parse(jsonMatch[0])

    return new Response(JSON.stringify(filters), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ keywords: [], diet_tags: [], allergen_free: [], cuisine: null }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
  }
})
