
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// =====================================================
// DEEPGUARDAI - GEMINI IMAGE FORENSICS EDGE FUNCTION
// =====================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const GEMINI_MODEL =
  Deno.env.get("GEMINI_MODEL") || "gemini-3.8-flash";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_RETRIES = 3;

// =====================================================
// JSON RESPONSE HELPER
// =====================================================

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

// =====================================================
// IMAGE VALIDATION
// =====================================================

function validateImage(
  imageBase64: string,
  mimeType: string
) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ];

  const normalizedMime = mimeType.toLowerCase().trim();

  if (!allowedTypes.includes(normalizedMime)) {
    throw new Error(
      "Unsupported image format. Please use JPG, PNG, WEBP, HEIC or HEIF."
    );
  }

  // Remove whitespace from base64
  const cleanBase64 = imageBase64.replace(/\s/g, "");

  if (!cleanBase64) {
    throw new Error("Image data is empty.");
  }

  // Validate base64 characters
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
    throw new Error("Invalid Base64 image data.");
  }

  // Approximate decoded image size
  const estimatedSize = Math.floor(
    (cleanBase64.length * 3) / 4
  );

  if (estimatedSize > MAX_IMAGE_SIZE) {
    throw new Error(
      "Image size exceeds the 10 MB limit."
    );
  }

  return {
    imageBase64: cleanBase64,
    mimeType: normalizedMime,
  };
}

// =====================================================
// GEMINI STRUCTURED OUTPUT SCHEMA
// =====================================================

const analysisSchema = {
  type: "object",
  properties: {
    verdict: {
      type: "string",
      enum: ["real", "ai_generated", "manipulated"],
    },

    scores: {
      type: "object",
      properties: {
        real: { type: "integer" },
        aiGenerated: { type: "integer" },
        manipulated: { type: "integer" },
      },
      required: [
        "real",
        "aiGenerated",
        "manipulated",
      ],
    },

    signals: {
      type: "object",
      properties: {
        facialLandmarkConsistency: {
          type: "boolean",
        },
        frequencyArtifactScore: {
          type: "number",
        },
        noisePatternResult: {
          type: "string",
          enum: ["Consistent", "Anomalous"],
        },
        metadataIntegrity: {
          type: "boolean",
        },
        compressionArtifacts: {
          type: "number",
        },
        skinTextureNaturalness: {
          type: "number",
        },
        eyeReflectionConsistency: {
          type: "boolean",
        },
        backgroundCoherence: {
          type: "number",
        },
      },
      required: [
        "facialLandmarkConsistency",
        "frequencyArtifactScore",
        "noisePatternResult",
        "metadataIntegrity",
        "compressionArtifacts",
        "skinTextureNaturalness",
        "eyeReflectionConsistency",
        "backgroundCoherence",
      ],
    },

    explanation: {
      type: "string",
    },
  },

  required: [
    "verdict",
    "scores",
    "signals",
    "explanation",
  ],
};

// =====================================================
// FORENSIC ANALYSIS PROMPT
// =====================================================

const forensicPrompt = `
You are DeepGuardAI, an expert visual image analysis assistant.

Analyze the supplied image and classify it into one of
three categories:

1. REAL
Authentic-looking photographs captured using cameras
or mobile phones.

2. AI_GENERATED
Images that appear to have been synthesized using
generative AI models such as Midjourney, DALL-E,
Stable Diffusion, or other image generation systems.

3. MANIPULATED
Photographs that appear to have been edited, composited,
spliced, retouched, or modified.

EXAMINE THESE VISUAL FORENSIC INDICATORS:

REAL PHOTOGRAPH INDICATORS:
- Natural-looking lighting and shadows.
- Realistic skin texture and imperfections.
- Natural depth of field and optical effects.
- Consistent perspective and geometry.
- Natural photographic noise and image texture.
- Realistic reflections and material details.
- Natural background complexity.

AI-GENERATED INDICATORS:
- Artificially smooth or plastic-looking textures.
- Inconsistent anatomy or geometry.
- Unnatural reflections.
- Repetitive or synthetic textures.
- Distorted text and fine details.
- Inconsistent hair and fabric patterns.
- Unrealistic lighting or shadows.
- Incoherent background elements.

MANIPULATED IMAGE INDICATORS:
- Visible compositing boundaries.
- Inconsistent lighting across regions.
- Suspicious repeated textures.
- Unnatural object transitions.
- Perspective or scale inconsistencies.
- Region-specific visual compression differences.

IMPORTANT CLASSIFICATION RULES:

1. Never classify an image as AI-generated simply
   because it is blurry or compressed.

2. WhatsApp and social media compression are normal.

3. Do not assume every portrait or selfie is real.

4. Do not assume every polished image is AI-generated.

5. Evaluate actual visual evidence.

6. Do not invent EXIF metadata or camera sensor
   measurements.

7. The image is being assessed visually. Do not claim
   that sensor noise, metadata integrity or frequency
   artifacts have been independently measured.

8. If a signal cannot be assessed, use a conservative
   estimate and explain the limitation.

9. Metadata integrity must be false because this
   request does not independently provide verified
   original image metadata.

10. Facial and eye consistency should be evaluated
    only when a visible face is present.

SCORING REQUIREMENTS:

- Produce three integer scores between 0 and 100.
- Scores must add up to exactly 100.
- The highest score must match the verdict.
- Avoid unjustified confidence.
- Normally give the winning category 55-95%.
- Do not claim forensic certainty from visual inspection.

SIGNAL REQUIREMENTS:

- frequencyArtifactScore: 1.0 to 10.0.
- compressionArtifacts: 1.0 to 10.0.
- skinTextureNaturalness: 1.0 to 10.0.
- backgroundCoherence: 1.0 to 10.0.
- noisePatternResult: Consistent or Anomalous.
- All boolean fields must contain true or false.

EXPLANATION:

Provide 3-4 detailed sentences describing the actual
visual evidence supporting the classification.

Return only JSON matching the supplied response schema.
`;

// =====================================================
// GEMINI REQUEST WITH RETRIES
// =====================================================

async function callGemini(
  apiKey: string,
  imageBase64: string,
  mimeType: string
): Promise<Response> {

  const requestBody = {
    model: GEMINI_MODEL,

    input: [
      {
        type: "text",
        text: forensicPrompt +
          "\n\nAnalyze the attached image and return its forensic assessment.",
      },
      {
        type: "image",
        mime_type: mimeType,
        data: imageBase64,
      },
    ],

    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: analysisSchema,
    },
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify(requestBody),

        signal: AbortSignal.timeout(60000),
      });

      if (response.ok) {
        return response;
      }

      const errorText = await response.text();

      console.error(
        `Gemini attempt ${attempt + 1} failed:`,
        response.status,
        errorText
      );

      // Retry temporary server and rate-limit errors
      const retryableStatuses = [
        429,
        500,
        502,
        503,
        504,
      ];

      if (
        !retryableStatuses.includes(response.status) ||
        attempt === MAX_RETRIES
      ) {
        return new Response(errorText, {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const delay = 1000 * Math.pow(2, attempt);

      console.log(
        `Retrying Gemini in ${delay}ms...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );

    } catch (error) {
      console.error(
        `Gemini network error on attempt ${attempt + 1}:`,
        error
      );

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt);

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  throw new Error("Gemini request failed after retries.");
}

// =====================================================
// EXTRACT GEMINI INTERACTION RESPONSE
// =====================================================

function extractGeminiText(data: any): string {
  // Support a direct output_text field if provided
  if (
    typeof data.output_text === "string" &&
    data.output_text.trim()
  ) {
    return data.output_text.trim();
  }

  // Extract text from model_output steps
  const textParts: string[] = [];

  if (Array.isArray(data.steps)) {
    for (const step of data.steps) {
      if (
        step.type === "model_output" &&
        Array.isArray(step.content)
      ) {
        for (const part of step.content) {
          if (
            part.type === "text" &&
            typeof part.text === "string"
          ) {
            textParts.push(part.text);
          }
        }
      }
    }
  }

  return textParts.join("\n").trim();
}

// =====================================================
// VALIDATE GEMINI ANALYSIS
// =====================================================

function validateAnalysis(analysis: any): boolean {
  const validVerdicts = [
    "real",
    "ai_generated",
    "manipulated",
  ];

  if (
    !analysis ||
    !validVerdicts.includes(analysis.verdict) ||
    !analysis.scores ||
    !analysis.signals ||
    typeof analysis.explanation !== "string"
  ) {
    return false;
  }

  const scores = [
    analysis.scores.real,
    analysis.scores.aiGenerated,
    analysis.scores.manipulated,
  ];

  if (
    scores.some(
      (score: number) =>
        !Number.isInteger(score) ||
        score < 0 ||
        score > 100
    )
  ) {
    return false;
  }

  // Scores must add up to exactly 100
  const totalScore = scores.reduce(
    (sum: number, score: number) => sum + score,
    0
  );

  if (totalScore !== 100) {
    return false;
  }

  const winningScore =
    analysis.verdict === "real"
      ? analysis.scores.real
      : analysis.verdict === "ai_generated"
      ? analysis.scores.aiGenerated
      : analysis.scores.manipulated;

  if (winningScore !== Math.max(...scores)) {
    return false;
  }

  const signals = analysis.signals;

  const booleanFields = [
    "facialLandmarkConsistency",
    "metadataIntegrity",
    "eyeReflectionConsistency",
  ];

  for (const field of booleanFields) {
    if (typeof signals[field] !== "boolean") {
      return false;
    }
  }

  const numericFields = [
    "frequencyArtifactScore",
    "compressionArtifacts",
    "skinTextureNaturalness",
    "backgroundCoherence",
  ];

  for (const field of numericFields) {
    if (
      typeof signals[field] !== "number" ||
      !Number.isFinite(signals[field]) ||
      signals[field] < 1 ||
      signals[field] > 10
    ) {
      return false;
    }
  }

  if (
    !["Consistent", "Anomalous"].includes(
      signals.noisePatternResult
    )
  ) {
    return false;
  }

  return true;
}

// =====================================================
// MAIN EDGE FUNCTION
// =====================================================

serve(async (req) => {

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed. Use POST." },
      405
    );
  }

  try {

    console.log("DeepGuardAI image analysis started.");

    // 1. Read request body
    let body: any;

    try {
      body = await req.json();
    } catch {
      return jsonResponse(
        { error: "Invalid JSON request body." },
        400
      );
    }

    const { imageBase64, mimeType } = body;

    // 2. Validate required fields
    if (
      typeof imageBase64 !== "string" ||
      typeof mimeType !== "string" ||
      !imageBase64 ||
      !mimeType
    ) {
      return jsonResponse(
        {
          error:
            "imageBase64 and mimeType are required.",
        },
        400
      );
    }

    // 3. Validate image
    let validatedImage;

    try {
      validatedImage = validateImage(
        imageBase64,
        mimeType
      );
    } catch (error) {
      return jsonResponse(
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid image.",
        },
        400
      );
    }

    // 4. Read Gemini secret
    const GEMINI_API_KEY =
      Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      console.error(
        "GEMINI_API_KEY is missing from Supabase Secrets."
      );

      return jsonResponse(
        {
          error:
            "Gemini API key is not configured. Add GEMINI_API_KEY in Supabase Secrets.",
        },
        500
      );
    }

    // 5. Call Gemini
    console.log(
      `Sending image to Gemini model: ${GEMINI_MODEL}`
    );

    const geminiResponse = await callGemini(
      GEMINI_API_KEY,
      validatedImage.imageBase64,
      validatedImage.mimeType
    );

    // 6. Handle API errors
    if (!geminiResponse.ok) {

      const status = geminiResponse.status;

      let providerMessage = "";

      try {
        const errorData = await geminiResponse.json();

        providerMessage =
          errorData.error?.message || "";
      } catch {
        // Keep provider message empty if response is not JSON
      }

      console.error(
        "Gemini final error:",
        status,
        providerMessage
      );

      if (status === 400) {
        return jsonResponse(
          {
            error:
              "Gemini rejected the request. Check image format and request parameters.",
            providerStatus: status,
          },
          400
        );
      }

      if (status === 401 || status === 403) {
        return jsonResponse(
          {
            error:
              "Gemini API key is invalid or does not have permission to use this model.",
            providerStatus: status,
          },
          502
        );
      }

      if (status === 404) {
        return jsonResponse(
          {
            error:
              "Gemini model or API endpoint was not found. Check GEMINI_MODEL and API access.",
            providerStatus: status,
          },
          502
        );
      }

      if (status === 429) {
        return jsonResponse(
          {
            error:
              "Gemini rate limit exceeded. Please try again later.",
            providerStatus: status,
          },
          429
        );
      }

      if (status >= 500) {
        return jsonResponse(
          {
            error:
              "Gemini service is temporarily unavailable. Please try again later.",
            providerStatus: status,
          },
          503
        );
      }

      return jsonResponse(
        {
          error: "Gemini analysis request failed.",
          providerStatus: status,
        },
        502
      );
    }

    // 7. Read Gemini response
    const geminiData = await geminiResponse.json();

    console.log(
      "Gemini interaction status:",
      geminiData.status
    );

    if (
      geminiData.status &&
      geminiData.status !== "completed"
    ) {
      console.error(
        "Gemini interaction did not complete:",
        geminiData.status
      );

      return jsonResponse(
        {
          error:
            "Gemini analysis did not complete successfully.",
        },
        502
      );
    }

    // 8. Extract generated JSON
    const content = extractGeminiText(geminiData);

    if (!content) {
      console.error(
        "Gemini returned no text:",
        JSON.stringify(geminiData)
      );

      return jsonResponse(
        {
          error:
            "Gemini returned an empty analysis.",
        },
        502
      );
    }

    // 9. Parse JSON
    let analysis: any;

    try {
      analysis = JSON.parse(content);
    } catch (error) {
      console.error(
        "Gemini JSON parsing failed:",
        error
      );

      console.error(
        "Gemini output:",
        content
      );

      return jsonResponse(
        {
          error:
            "Unable to parse Gemini analysis results.",
        },
        502
      );
    }

    // 10. Validate analysis structure and scores
    if (!validateAnalysis(analysis)) {
      console.error(
        "Gemini returned invalid analysis:",
        JSON.stringify(analysis)
      );

      return jsonResponse(
        {
          error:
            "Gemini returned invalid analysis data. Please retry.",
        },
        502
      );
    }

    // 11. Return result to frontend
    console.log(
      "DeepGuardAI analysis completed successfully:",
      analysis.verdict
    );

    return jsonResponse(analysis, 200);

  } catch (error) {

    console.error(
      "DeepGuardAI Edge Function error:",
      error
    );

    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" ||
       error.name === "AbortError");

    return jsonResponse(
      {
        error: isTimeout
          ? "Gemini request timed out. Please try again."
          : "Internal server error during image analysis.",
      },
      isTimeout ? 504 : 500
    );
  }
});
