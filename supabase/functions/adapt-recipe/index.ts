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
    const { recipe, targetDiet, allergens } = await req.json()

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
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const adapted = JSON.parse(jsonMatch[0])

    return new Response(
      JSON.stringify({ adapted, changes: adapted.changes_summary }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } }
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
