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
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not found in environment' }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { ingredients, dietary, allergens } = body

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: 'Return JSON only. No prose. No markdown.',
        messages: [
          {
            role: 'user',
            content: `<ingredients>${ingredients.join(', ')}</ingredients>
<dietary>${dietary.join(', ') || 'none'}</dietary>
<exclude_allergens>${allergens.join(', ') || 'none'}</exclude_allergens>
<task>Generate 3 distinct recipes using these ingredients. Respect dietary restrictions. Exclude all listed allergens completely.</task>
<format>[{
  "title": string,
  "description": string (2 sentences),
  "ingredients": [{"amount": string, "unit": string, "item": string}],
  "steps": [string],
  "cuisine": string,
  "prep_time": number (minutes),
  "cook_time": number (minutes),
  "serving_size": number,
  "diet_tags": string[]
}]</format>`,
          },
        ],
      }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Anthropic API error ${response.status}: ${responseText}` }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
    }

    const data = JSON.parse(responseText)
    const text = data.content[0].text.trim()
    const recipes = JSON.parse(text)

    return new Response(JSON.stringify({ recipes }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
