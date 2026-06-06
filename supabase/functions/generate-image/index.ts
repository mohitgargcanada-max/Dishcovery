const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const falKey = (Deno.env.get('FAL_API_KEY') || Deno.env.get('FAL_API_KEY '))?.trim()
    const anthropicKey = (Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY '))?.trim()

    if (!falKey) {
      return new Response(
        JSON.stringify({ error: 'FAL_API_KEY not set' }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
    }

    const { title, cuisine, ingredients } = await req.json()

    // Step 1: Use Claude to craft a hyper-specific food photography prompt
    let imagePrompt = `${title}, ${cuisine || ''} dish, professional food photography`

    if (anthropicKey) {
      try {
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 200,
            system: 'You are a food photography prompt engineer. Return only the image generation prompt, nothing else.',
            messages: [{
              role: 'user',
              content: `Write a detailed Stable Diffusion image prompt for a professional food photo of "${title}" (${cuisine || 'international'} cuisine).
Include: exact dish appearance, colors, plating style, garnishes, bowl/plate type, background.
Format: single paragraph, under 120 words, no quotes.
Example style: "steaming bowl of rich brown miso ramen with soft-boiled egg, nori sheet, bamboo shoots and green onions, in a white ceramic bowl, dark wooden table, soft natural lighting, overhead angle"`
            }],
          }),
        })

        if (claudeRes.ok) {
          const claudeData = await claudeRes.json()
          const rawPrompt = claudeData.content[0].text.trim()
          imagePrompt = `${rawPrompt}, professional food photography, 4K, appetizing, restaurant quality, shallow depth of field`
        }
      } catch {
        // Fall back to basic prompt
      }
    }

    // Step 2: Generate with Flux Dev (much higher quality than Schnell)
    const falRes = await fetch('https://fal.run/fal-ai/flux/dev', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        image_size: 'landscape_4_3',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
      }),
    })

    const falText = await falRes.text()

    if (!falRes.ok) {
      return new Response(
        JSON.stringify({ error: `Fal.ai error ${falRes.status}: ${falText}` }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
    }

    const falData = JSON.parse(falText)
    const imageUrl = falData.images?.[0]?.url

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'No image returned' }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ url: imageUrl, prompt: imagePrompt }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } }
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
