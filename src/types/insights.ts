import { TimeRange } from './campaign';
import { KPIType } from './kpi';

// Interface pour l'analyse OpenAI
export interface OpenAIAnalysis {
  campaignSummary: {
    name: string;
    type: string;
    biddingStrategy: string;
    launchDate: string;
    lastModifications: Array<{
      date: string;
      type: 'CREATIVE' | 'TARGETING' | 'BIDDING' | 'BUDGET';
      description: string;
    }>;
  };
  performanceByPeriod: Record<TimeRange, {
    keyInsights: string[];
    kpiSummary: Record<KPIType, string>;
  }>;
  technicalAnalysis: string;
  simplifiedAnalysis: string;
}

// Interface pour l'analyse Google AI
export interface GoogleAIAnalysis {
  underperformingSegments: Array<{
    segment: 'AGE' | 'GENDER' | 'DEVICE' | 'LOCATION' | 'AUDIENCE';
    value: string;
    issue: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  behavioralSignals: Array<{
    metric: string;
    observation: string;
    significance: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  technicalInsights: string[];
}

// Interface pour la recommandation finale croisée
export interface CrossAnalysisRecommendation {
  hypotheses: Array<{
    title: string;
    explanation: string;
    confidence: number;
  }>;
  recommendations: Array<{
    title: string;
    action: string;
    expectedImpact: {
      metrics: KPIType[];
      value: string;
    };
    implementation: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  strategicSummary: string;
}

// Interface complète pour l'analyse IA
export interface AIAnalysis {
  openai: OpenAIAnalysis;
  googleAI: GoogleAIAnalysis;
  crossAnalysis: CrossAnalysisRecommendation;
  generatedAt: string;
  campaignId: string;
}