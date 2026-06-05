const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, ingredients, steps, cuisine } = await req.json()
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 250,
        system: 'Return JSON only. No prose.',
        messages: [
          {
            role: 'user',
            content: `<recipe>
Title: ${title}
Cuisine: ${cuisine}
Ingredients: ${JSON.stringify(ingredients)}
Steps: ${steps.join(' | ')}
</recipe>
<task>Analyze and score this recipe.</task>
<format>{
  "nutrition_score": 1-10,
  "difficulty_score": 1-10,
  "authenticity_score": 1-10,
  "calories_per_serving": number,
  "diet_tags": ["vegan"|"vegetarian"|"keto"|"gluten-free"|"dairy-free"|"halal"|"low-calorie"],
  "allergen_warnings": ["nuts"|"dairy"|"gluten"|"eggs"|"soy"|"shellfish"|"fish"|"sesame"]
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
    const score = JSON.parse(text)

    return new Response(JSON.stringify(score), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
