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
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    const { title, ingredients, steps, cuisine } = await req.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: 'Return JSON only. No prose.',
        messages: [{
          role: 'user',
          content: `<recipe>
Title: ${title}
Cuisine: ${cuisine}
Ingredients: ${JSON.stringify(ingredients)}
Steps: ${Array.isArray(steps) ? steps.join(' | ') : steps}
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
        }],
      }),
    })

    const responseText = await response.text()
    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Anthropic ${response.status}: ${responseText}` }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    const data = JSON.parse(responseText)
    const text = data.content[0].text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const score = JSON.parse(jsonMatch[0])

    return new Response(JSON.stringify(score), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
