const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ingredients, dietary, allergens } = await req.json()
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey!,
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

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Anthropic error: ${err}`)
    }

    const data = await response.json()
    const text = data.content[0].text.trim()
    const recipes = JSON.parse(text)

    return new Response(JSON.stringify({ recipes }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
