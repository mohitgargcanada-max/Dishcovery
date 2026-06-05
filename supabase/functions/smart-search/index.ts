const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, userId } = await req.json()
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 150,
        system: 'Return JSON only. No prose.',
        messages: [
          {
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
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Anthropic error: ${err}`)
    }

    const data = await response.json()
    const text = data.content[0].text.trim()
    const filters = JSON.parse(text)

    return new Response(JSON.stringify(filters), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
