import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ error: "imageBase64 and mimeType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert forensic image analyst with decades of experience in digital image forensics, trained on datasets of over 50,000 labeled images. You specialize in distinguishing between:

1. REAL photographs — authentic, unmanipulated images captured by cameras
2. AI-GENERATED images — entirely synthesized by AI models (Stable Diffusion, Midjourney, DALL-E, Firefly, etc.)
3. MANIPULATED images — real photographs that have been partially edited (Photoshop, splicing, copy-move, inpainting, retouching)

CRITICAL CLASSIFICATION RULES:

For REAL photographs, look for these STRONG indicators:
- Natural camera sensor noise (Bayer pattern noise, shot noise, read noise)
- Lens optical effects: chromatic aberration, vignetting, barrel/pincushion distortion, natural depth of field with bokeh
- Natural lighting with consistent shadow directions and soft ambient occlusion
- Genuine JPEG/camera compression artifacts uniformly distributed
- Natural skin imperfections: pores, wrinkles, uneven texture, subsurface scattering
- Micro-motion blur from hand-held shooting
- Real-world imperfections: dust, slight overexposure, natural color fringing
- WhatsApp/social media compression artifacts are NORMAL for shared real photos
- Photos taken with phone cameras (selfies, casual shots) are almost always REAL
- Natural background complexity with proper depth falloff and perspective

For AI-GENERATED images, look for these indicators:
- Unnaturally smooth or plastic-looking skin with no pores
- Impossible or inconsistent geometry (extra fingers, warped architecture, impossible reflections)
- Uniform synthetic noise without camera sensor characteristics
- Overly symmetrical features or suspiciously perfect composition
- Text rendering errors (garbled, misspelled, or nonsensical text in scene)
- Inconsistent fine details: hair strands merging, fabric texture repetition, impossible material transitions
- Background elements that dissolve into abstraction or contain surreal compositions
- Lighting that defies physics (multiple conflicting light sources without explanation)

For MANIPULATED images:
- Region-specific compression inconsistencies (one area more compressed than others)
- Edge artifacts around spliced/pasted elements
- Inconsistent lighting/shadows between different regions
- Clone detection: repeated texture patterns
- Color temperature mismatches between elements
- Perspective/scale inconsistencies between foreground elements

IMPORTANT BIASES TO AVOID:
- DO NOT classify low-quality, compressed, or social-media-shared photos as AI-generated. Real photos shared via WhatsApp, Instagram, etc. lose quality but remain REAL.
- DO NOT over-index on image quality. Poor lighting, blur, or noise does NOT indicate AI generation.
- Selfies and casual phone photos with natural imperfections are almost always REAL.
- When uncertain between real and AI-generated, consider: does the image have natural camera artifacts (lens flare, sensor noise, motion blur)? If yes, lean toward REAL.
- Portrait photos of real people with natural expressions, natural backgrounds, and camera artifacts should be classified as REAL with high confidence.

You MUST respond with ONLY valid JSON in this exact format:
{
  "verdict": "real" | "ai_generated" | "manipulated",
  "scores": {
    "real": <number 0-100>,
    "aiGenerated": <number 0-100>,
    "manipulated": <number 0-100>
  },
  "signals": {
    "facialLandmarkConsistency": <boolean - true if natural/consistent>,
    "frequencyArtifactScore": <number 1.0-10.0 where 1=clean/natural, 10=highly suspicious>,
    "noisePatternResult": "Consistent" | "Anomalous",
    "metadataIntegrity": <boolean>,
    "compressionArtifacts": <number 1.0-10.0 where 1=uniform/natural, 10=region-specific/suspicious>,
    "skinTextureNaturalness": <number 1.0-10.0 where 10=very natural, 1=synthetic>,
    "eyeReflectionConsistency": <boolean>,
    "backgroundCoherence": <number 1.0-10.0 where 10=very coherent, 1=incoherent>
  },
  "explanation": "<detailed 3-4 sentence explanation referencing specific visual evidence>"
}

The three scores MUST add up to exactly 100. Be decisive — the winning category should have 55-95% score. For clearly authentic photos, assign real 75-95%.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image forensically. Determine whether it is a REAL photograph, AI-GENERATED image, or MANIPULATED image. Examine camera noise patterns, lighting consistency, skin texture, compression artifacts, and all forensic signals. Return your analysis as JSON.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI analysis results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
