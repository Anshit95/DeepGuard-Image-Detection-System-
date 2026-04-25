import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Verdict = 'real' | 'ai_generated' | 'manipulated';

export interface DetectionSignals {
  facialLandmarkConsistency: boolean;
  frequencyArtifactScore: number;
  noisePatternResult: string;
  metadataIntegrity: boolean;
  compressionArtifacts: number;
  skinTextureNaturalness: number;
  eyeReflectionConsistency: boolean;
  backgroundCoherence: number;
}

export interface AnalysisResult {
  id: string;
  imageUrl: string;
  imageName: string;
  verdict: Verdict;
  confidence: number;
  scores: {
    real: number;
    aiGenerated: number;
    manipulated: number;
  };
  signals: DetectionSignals;
  explanation: string;
  timestamp: number;
}

interface AnalysisStore {
  history: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  isAnalyzing: boolean;
  analysisStep: string;
  setCurrentAnalysis: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (v: boolean) => void;
  setAnalysisStep: (step: string) => void;
  addToHistory: (result: AnalysisResult) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      history: [],
      currentAnalysis: null,
      isAnalyzing: false,
      analysisStep: '',
      setCurrentAnalysis: (result) => set({ currentAnalysis: result }),
      setIsAnalyzing: (v) => set({ isAnalyzing: v }),
      setAnalysisStep: (step) => set({ analysisStep: step }),
      addToHistory: (result) =>
        set((state) => ({ history: [result, ...state.history] })),
      removeFromHistory: (id) =>
        set((state) => ({ history: state.history.filter((h) => h.id !== id) })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'deepguard-analysis-v2', partialize: (state) => ({ history: state.history }) }
  )
);
