const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recipe, targetDiet, allergens } = await req.json()
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
        max_tokens: 1500,
        system: 'Return JSON only. No prose.',
        messages: [
          {
            role: 'user',
            content: `<original_recipe>${JSON.stringify(recipe)}</original_recipe>
<adapt_for>${targetDiet}</adapt_for>
<exclude_allergens>${allergens.join(', ')}</exclude_allergens>
<task>Adapt this recipe. Keep the same dish concept. Substitute ingredients to meet dietary requirements. Adjust steps only if necessary.</task>
<format>{
  "title": string (modified title),
  "description": string,
  "ingredients": same structure as original,
  "steps": same structure as original,
  "changes_summary": string (what changed and why),
  "diet_tags": string[]
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
    const adapted = JSON.parse(text)

    return new Response(
      JSON.stringify({ adapted, changes: adapted.changes_summary }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } }
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
