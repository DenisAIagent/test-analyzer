import { CampaignType, TimeRange } from './campaign';

// Types de KPI disponibles
export type KPIType = 
  | 'roas' 
  | 'conversions' 
  | 'conversion_value' 
  | 'cpa' 
  | 'conversion_rate' 
  | 'ctr' 
  | 'cost'
  | 'cpv' 
  | 'views' 
  | 'view_rate' 
  | 'watch_time' 
  | 'subscribers_gained'
  | 'cpc' 
  | 'impression_share' 
  | 'quality_score'
  | 'impressions' 
  | 'interactions';

// Mapping des KPI selon le type de campagne
export const campaignTypeToKPI: Record<CampaignType, KPIType[]> = {
  PERFORMANCE_MAX: ["roas", "conversions", "conversion_value", "cpa", "conversion_rate", "ctr", "cost"],
  VIDEO: ["cpv", "views", "view_rate", "watch_time", "ctr", "subscribers_gained", "conversions"],
  SEARCH: ["cpc", "ctr", "conversions", "impression_share", "quality_score"],
  DISPLAY: ["impressions", "ctr", "interactions", "conversion_rate", "cpa"],
};

// Configuration des affichages de KPI
export interface KPIConfig {
  label: string;
  description: string;
  format: 'number' | 'percentage' | 'currency' | 'duration' | 'x';
  trend: 'up-good' | 'down-good';
  aggregation: 'sum' | 'average' | 'last';
  benchmark?: number;
}

// Configuration complète des KPI
export const kpiConfig: Record<KPIType, KPIConfig> = {
  roas: {
    label: 'ROAS',
    description: 'Retour sur dépense publicitaire',
    format: 'x',
    trend: 'up-good',
    aggregation: 'average',
    benchmark: 3.0,
  },
  conversions: {
    label: 'Conversions',
    description: 'Nombre total de conversions',
    format: 'number',
    trend: 'up-good',
    aggregation: 'sum',
  },
  conversion_value: {
    label: 'Valeur des conv.',
    description: 'Valeur totale des conversions',
    format: 'currency',
    trend: 'up-good',
    aggregation: 'sum',
  },
  cpa: {
    label: 'CPA',
    description: 'Coût par acquisition',
    format: 'currency',
    trend: 'down-good',
    aggregation: 'average',
  },
  conversion_rate: {
    label: 'Taux de conv.',
    description: 'Taux de conversion',
    format: 'percentage',
    trend: 'up-good',
    aggregation: 'average',
  },
  ctr: {
    label: 'CTR',
    description: 'Taux de clics',
    format: 'percentage',
    trend: 'up-good',
    aggregation: 'average',
  },
  cost: {
    label: 'Coût',
    description: 'Dépense totale',
    format: 'currency',
    trend: 'down-good',
    aggregation: 'sum',
  },
  cpv: {
    label: 'CPV',
    description: 'Coût par vue',
    format: 'currency',
    trend: 'down-good',
    aggregation: 'average',
  },
  views: {
    label: 'Vues',
    description: 'Nombre total de vues',
    format: 'number',
    trend: 'up-good',
    aggregation: 'sum',
  },
  view_rate: {
    label: 'Taux de vue',
    description: 'Pourcentage de vues complètes',
    format: 'percentage',
    trend: 'up-good',
    aggregation: 'average',
  },
  watch_time: {
    label: 'Temps de visionnage',
    description: 'Durée totale de visionnage',
    format: 'duration',
    trend: 'up-good',
    aggregation: 'sum',
  },
  subscribers_gained: {
    label: 'Abonnés',
    description: 'Nouveaux abonnés',
    format: 'number',
    trend: 'up-good',
    aggregation: 'sum',
  },
  cpc: {
    label: 'CPC',
    description: 'Coût par clic',
    format: 'currency',
    trend: 'down-good',
    aggregation: 'average',
  },
  impression_share: {
    label: 'Part d\'impression',
    description: 'Part des impressions potentielles obtenues',
    format: 'percentage',
    trend: 'up-good',
    aggregation: 'average',
  },
  quality_score: {
    label: 'Score de qualité',
    description: 'Qualité des annonces et des mots-clés',
    format: 'number',
    trend: 'up-good',
    aggregation: 'average',
  },
  impressions: {
    label: 'Impressions',
    description: 'Nombre total d\'affichages',
    format: 'number',
    trend: 'up-good',
    aggregation: 'sum',
  },
  interactions: {
    label: 'Interactions',
    description: 'Nombre total d\'interactions',
    format: 'number',
    trend: 'up-good',
    aggregation: 'sum',
  },
};

// Interface pour les données KPI
export interface KPIData {
  type: KPIType;
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend?: 'up' | 'down' | 'stable';
  timeRange: TimeRange;
}

// Interface pour les historiques de données KPI (pour les graphiques)
export interface KPIHistoryData {
  type: KPIType;
  data: Array<{
    date: string;
    value: number;
  }>;
  timeRange: TimeRange;
}