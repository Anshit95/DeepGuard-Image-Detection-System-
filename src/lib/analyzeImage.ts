import { AnalysisResult, DetectionSignals, Verdict } from '@/store/useAnalysisStore';
import { supabase } from '@/integrations/supabase/client';

const ANALYSIS_STEPS = [
  "Initializing neural networks...",
  "Detecting facial landmarks...",
  "Running frequency domain analysis...",
  "Analyzing noise patterns & textures...",
  "Consulting ensemble models (XceptionNet, EfficientNet, ViT)...",
  "Generating confidence scores...",
  "Compiling forensic report...",
];

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export { ANALYSIS_STEPS };

export async function analyzeImage(
  file: File,
  imageUrl: string,
  onStep: (step: string) => void
): Promise<AnalysisResult> {
  let stepIndex = 0;
  const stepInterval = setInterval(() => {
    if (stepIndex < ANALYSIS_STEPS.length) {
      onStep(ANALYSIS_STEPS[stepIndex]);
      stepIndex++;
    }
  }, 700);

  try {
    onStep(ANALYSIS_STEPS[0]);

    const imageBase64 = await fileToBase64(file);
    const mimeType = file.type || 'image/jpeg';

    const { data, error } = await supabase.functions.invoke('analyze-image', {
      body: { imageBase64, mimeType },
    });

    clearInterval(stepInterval);

    if (error) {
      throw new Error(error.message || 'Analysis failed');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    onStep(ANALYSIS_STEPS[ANALYSIS_STEPS.length - 1]);

    const verdictMap: Record<string, Verdict> = {
      real: 'real',
      ai_generated: 'ai_generated',
      manipulated: 'manipulated',
    };

    const verdict: Verdict = verdictMap[data.verdict] || 'real';
    const scores = {
      real: data.scores?.real ?? 34,
      aiGenerated: data.scores?.aiGenerated ?? 33,
      manipulated: data.scores?.manipulated ?? 33,
    };

    const confidence = Math.max(scores.real, scores.aiGenerated, scores.manipulated);

    const signals: DetectionSignals = {
      facialLandmarkConsistency: data.signals?.facialLandmarkConsistency ?? true,
      frequencyArtifactScore: data.signals?.frequencyArtifactScore ?? 5.0,
      noisePatternResult: data.signals?.noisePatternResult ?? 'Consistent',
      metadataIntegrity: data.signals?.metadataIntegrity ?? true,
      compressionArtifacts: data.signals?.compressionArtifacts ?? 5.0,
      skinTextureNaturalness: data.signals?.skinTextureNaturalness ?? 5.0,
      eyeReflectionConsistency: data.signals?.eyeReflectionConsistency ?? true,
      backgroundCoherence: data.signals?.backgroundCoherence ?? 5.0,
    };

    return {
      id: crypto.randomUUID(),
      imageUrl,
      imageName: file.name,
      verdict,
      confidence,
      scores,
      signals,
      explanation: data.explanation || 'Analysis complete.',
      timestamp: Date.now(),
    };
  } catch (err) {
    clearInterval(stepInterval);
    throw err;
  }
}
