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
    if (!falKey) {
      return new Response(
        JSON.stringify({ error: 'FAL_API_KEY not set in Edge Function secrets' }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
    }

    const { title, cuisine } = await req.json()

    const prompt = `Close-up professional food photography of "${title}", ${cuisine || 'international'} cuisine dish, served on an elegant plate, garnished and beautifully presented, soft natural side lighting, bokeh background, ultra-realistic, appetizing, Michelin star restaurant style, 4K, food magazine cover quality. The dish is clearly "${title}" — not a generic food photo.`

    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'landscape_4_3',
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Fal.ai error ${response.status}: ${responseText}` }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
    }

    const data = JSON.parse(responseText)
    const imageUrl = data.images?.[0]?.url

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'No image returned from Fal.ai' }),
        { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify({ url: imageUrl }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
