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
    const { ingredients, dietary, allergens, freeform } = body

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: 'You are a thoughtful, inclusive culinary assistant. Always respect dietary restrictions and allergen exclusions completely — never include restricted ingredients even in small amounts. Return JSON only. No prose. No markdown.',
        messages: [
          {
            role: 'user',
            content: `${freeform ? `<user_request>${freeform}</user_request>\n` : ''}<ingredients>${ingredients.join(', ')}</ingredients>
<dietary>${dietary.join(', ') || 'none'}</dietary>
<exclude_allergens>${allergens.join(', ') || 'none'}</exclude_allergens>
<task>Generate 3 distinct, delicious recipes${freeform ? ' that match the user\'s request' : ' using these ingredients'}. Carefully honour all dietary preferences and completely exclude every listed allergen — this is important for the user\'s health and wellbeing. Make each recipe feel special and approachable.</task>
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
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON in response: ' + text.substring(0, 200))
    const recipes = JSON.parse(jsonMatch[0])

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
