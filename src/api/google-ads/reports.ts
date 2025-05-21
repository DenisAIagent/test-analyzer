// Fonctions pour récupérer les données de performance Google Ads
import { getGoogleAdsClient } from './client';
import { DateRange, TimeRange, getDateRangeFromTimeRange, CampaignType } from '../../types/campaign';
import { KPIType, KPIData, KPIHistoryData, campaignTypeToKPI } from '../../types/kpi';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';

/**
 * Récupère les données de performance d'une campagne sur une période donnée
 * @param customerId ID du client Google Ads
 * @param campaignId ID de la campagne
 * @param dateRange Plage de dates (début et fin)
 * @param campaignType Type de campagne pour déterminer les KPI à récupérer
 * @returns Les données KPI
 */
export async function getCampaignPerformance(
  customerId: string,
  campaignId: string,
  dateRange: DateRange,
  campaignType: CampaignType
): Promise<KPIData[]> {
  try {
    const client = getGoogleAdsClient();
    const timeRange = getTimeRangeFromDates(dateRange);
    const kpiTypes = campaignTypeToKPI[campaignType];
    
    // Construire la requête GAQL en fonction du type de campagne
    const metricsToSelect = getMetricsForKPI(kpiTypes);
    
    const query = `
      SELECT
        campaign.id,
        segments.date,
        ${metricsToSelect.join(',\n        ')}
      FROM campaign
      WHERE 
        campaign.id = ${campaignId}
        AND segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
    `;
    
    const results = await client.query(customerId, query);
    
    // Calculer les KPI pour la période actuelle
    const currentData = aggregateKPIData(results, kpiTypes, timeRange);
    
    // Récupérer les données de la période précédente pour la comparaison
    const previousDateRange = getPreviousDateRange(dateRange);
    const previousQuery = `
      SELECT
        campaign.id,
        segments.date,
        ${metricsToSelect.join(',\n        ')}
      FROM campaign
      WHERE 
        campaign.id = ${campaignId}
        AND segments.date BETWEEN '${previousDateRange.startDate}' AND '${previousDateRange.endDate}'
    `;
    
    const previousResults = await client.query(customerId, previousQuery);
    const previousData = aggregateKPIData(previousResults, kpiTypes, timeRange, false);
    
    // Fusionner les données actuelles avec les données précédentes pour calculer les évolutions
    return mergeCurrentAndPreviousData(currentData, previousData);
  } catch (error) {
    console.error(`Erreur lors de la récupération des performances de la campagne ${campaignId}:`, error);
    throw error;
  }
}

/**
 * Récupère l'historique des performances d'une campagne sur une période donnée
 * @param customerId ID du client Google Ads
 * @param campaignId ID de la campagne
 * @param dateRange Plage de dates (début et fin)
 * @param kpiTypes Types de KPI à récupérer
 * @returns L'historique des données KPI pour les graphiques
 */
export async function getCampaignHistoricalPerformance(
  customerId: string,
  campaignId: string,
  dateRange: DateRange,
  kpiTypes: KPIType[]
): Promise<KPIHistoryData[]> {
  try {
    const client = getGoogleAdsClient();
    const timeRange = getTimeRangeFromDates(dateRange);
    
    // Construire la requête GAQL
    const metricsToSelect = getMetricsForKPI(kpiTypes);
    
    const query = `
      SELECT
        campaign.id,
        segments.date,
        ${metricsToSelect.join(',\n        ')}
      FROM campaign
      WHERE 
        campaign.id = ${campaignId}
        AND segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
      ORDER BY segments.date
    `;
    
    const results = await client.query(customerId, query);
    
    // Créer un tableau de tous les jours de la période
    const allDates = eachDayOfInterval({
      start: parseISO(dateRange.startDate),
      end: parseISO(dateRange.endDate)
    }).map(date => format(date, 'yyyy-MM-dd'));
    
    // Traiter les résultats et construire l'historique pour chaque KPI
    return kpiTypes.map(kpiType => {
      // Créer un dictionnaire des données par date
      const dataByDate: Record<string, number> = {};
      results.forEach((result: any) => {
        const date = result.segments.date;
        dataByDate[date] = extractKPIValue(result, kpiType);
      });
      
      // Construire le tableau final avec toutes les dates (même celles sans données)
      const historyData: KPIHistoryData = {
        type: kpiType,
        data: allDates.map(date => ({
          date,
          value: dataByDate[date] || 0
        })),
        timeRange
      };
      
      return historyData;
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'historique de performance pour la campagne ${campaignId}:`, error);
    throw error;
  }
}

// Fonctions utilitaires

/**
 * Convertit une paire de dates en TimeRange
 */
function getTimeRangeFromDates(dateRange: DateRange): TimeRange {
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 1) return '24h';
  if (daysDiff <= 3) return '3d';
  if (daysDiff <= 7) return '7d';
  if (daysDiff <= 14) return '14d';
  return '30d';
}

/**
 * Calcule la plage de dates précédente pour comparer les performances
 */
function getPreviousDateRange(currentRange: DateRange): DateRange {
  const startDate = new Date(currentRange.startDate);
  const endDate = new Date(currentRange.endDate);
  const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const previousStartDate = subDays(startDate, daysDiff);
  const previousEndDate = subDays(endDate, daysDiff);
  
  return {
    startDate: format(previousStartDate, 'yyyy-MM-dd'),
    endDate: format(previousEndDate, 'yyyy-MM-dd')
  };
}

/**
 * Obtient les métriques Google Ads correspondant aux KPI demandés
 */
function getMetricsForKPI(kpiTypes: KPIType[]): string[] {
  const metricsMapping: Record<KPIType, string[]> = {
    roas: ['metrics.conversion_value', 'metrics.cost_micros'],
    conversions: ['metrics.conversions'],
    conversion_value: ['metrics.conversion_value'],
    cpa: ['metrics.conversions', 'metrics.cost_micros'],
    conversion_rate: ['metrics.conversions', 'metrics.clicks'],
    ctr: ['metrics.clicks', 'metrics.impressions'],
    cost: ['metrics.cost_micros'],
    cpv: ['metrics.video_views', 'metrics.cost_micros'],
    views: ['metrics.video_views'],
    view_rate: ['metrics.video_views', 'metrics.impressions'],
    watch_time: ['metrics.video_quartile_p100_rate', 'metrics.video_views', 'metrics.average_video_duration', 'metrics.average_time_on_site'],
    subscribers_gained: ['metrics.video_views', 'metrics.all_conversions'],
    cpc: ['metrics.clicks', 'metrics.cost_micros'],
    impression_share: ['metrics.search_impression_share', 'metrics.search_rank_lost_impression_share'],
    quality_score: ['metrics.historical_quality_score'],
    impressions: ['metrics.impressions'],
    interactions: ['metrics.interactions'],
  };
  
  // Fusionner toutes les métriques nécessaires sans duplication
  const allMetrics = new Set<string>();
  kpiTypes.forEach(kpiType => {
    metricsMapping[kpiType]?.forEach(metric => allMetrics.add(metric));
  });
  
  return Array.from(allMetrics);
}

/**
 * Agrège les données brutes de l'API en KPI
 */
function aggregateKPIData(
  results: any[],
  kpiTypes: KPIType[],
  timeRange: TimeRange,
  isCurrent: boolean = true
): KPIData[] {
  // Initialiser les totaux pour chaque métrique
  const totals: Record<string, number> = {
    clicks: 0,
    impressions: 0,
    cost_micros: 0,
    conversions: 0,
    conversion_value: 0,
    video_views: 0,
    interactions: 0,
    video_quartile_p100_rate: 0,
    average_video_duration: 0,
    search_impression_share: 0,
    historical_quality_score: 0,
    all_conversions: 0,
    average_time_on_site: 0,
  };
  
  // Sommation de toutes les métriques
  results.forEach((result: any) => {
    const metrics = result.metrics;
    Object.keys(totals).forEach(key => {
      if (metrics && metrics[key] !== undefined) {
        totals[key] += Number(metrics[key]);
      }
    });
  });
  
  // Calculer les KPI à partir des totaux
  return kpiTypes.map(kpiType => {
    const value = calculateKPIValue(kpiType, totals);
    
    const kpiData: KPIData = {
      type: kpiType,
      value,
      timeRange,
    };
    
    // Ajouter la valeur précédente seulement pour les données actuelles
    if (!isCurrent) {
      kpiData.previousValue = value;
    }
    
    return kpiData;
  });
}

/**
 * Calcule la valeur d'un KPI à partir des totaux des métriques
 */
function calculateKPIValue(kpiType: KPIType, totals: Record<string, number>): number {
  switch (kpiType) {
    case 'roas':
      return totals.cost_micros > 0 ? (totals.conversion_value * 1000000) / totals.cost_micros : 0;
    case 'conversions':
      return totals.conversions;
    case 'conversion_value':
      return totals.conversion_value;
    case 'cpa':
      return totals.conversions > 0 ? totals.cost_micros / (totals.conversions * 1000000) : 0;
    case 'conversion_rate':
      return totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
    case 'ctr':
      return totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    case 'cost':
      return totals.cost_micros / 1000000;
    case 'cpv':
      return totals.video_views > 0 ? totals.cost_micros / (totals.video_views * 1000000) : 0;
    case 'views':
      return totals.video_views;
    case 'view_rate':
      return totals.impressions > 0 ? (totals.video_views / totals.impressions) * 100 : 0;
    case 'watch_time':
      // Estimation approximative du temps de visionnage total en secondes
      const avgDuration = totals.average_video_duration || 0;
      const completionRate = totals.video_quartile_p100_rate || 0;
      return totals.video_views * avgDuration * completionRate;
    case 'subscribers_gained':
      // Approximation, car Google Ads ne fournit pas directement cette métrique
      return totals.all_conversions * 0.05; // 5% des conversions comme approximation
    case 'cpc':
      return totals.clicks > 0 ? totals.cost_micros / (totals.clicks * 1000000) : 0;
    case 'impression_share':
      return totals.search_impression_share * 100;
    case 'quality_score':
      // We need to determine the appropriate count for averaging
      const count = totals.historical_quality_score > 0 ? Math.max(1, Object.keys(totals).length) : 1;
      return totals.historical_quality_score / count;
    case 'impressions':
      return totals.impressions;
    case 'interactions':
      return totals.interactions;
    default:
      return 0;
  }
}

/**
 * Extrait la valeur d'un KPI pour un jour donné
 */
function extractKPIValue(result: any, kpiType: KPIType): number {
  const metrics = result.metrics;
  
  switch (kpiType) {
    case 'roas':
      return metrics.cost_micros > 0 ? (metrics.conversion_value * 1000000) / metrics.cost_micros : 0;
    case 'conversions':
      return metrics.conversions || 0;
    case 'conversion_value':
      return metrics.conversion_value || 0;
    case 'cpa':
      return metrics.conversions > 0 ? metrics.cost_micros / (metrics.conversions * 1000000) : 0;
    case 'conversion_rate':
      return metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;
    case 'ctr':
      return metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
    case 'cost':
      return (metrics.cost_micros || 0) / 1000000;
    case 'cpv':
      return metrics.video_views > 0 ? metrics.cost_micros / (metrics.video_views * 1000000) : 0;
    case 'views':
      return metrics.video_views || 0;
    case 'view_rate':
      return metrics.impressions > 0 ? (metrics.video_views / metrics.impressions) * 100 : 0;
    case 'watch_time':
      const avgDuration = metrics.average_video_duration || 0;
      const completionRate = metrics.video_quartile_p100_rate || 0;
      return (metrics.video_views || 0) * avgDuration * completionRate;
    case 'subscribers_gained':
      return (metrics.all_conversions || 0) * 0.05;
    case 'cpc':
      return metrics.clicks > 0 ? metrics.cost_micros / (metrics.clicks * 1000000) : 0;
    case 'impression_share':
      return (metrics.search_impression_share || 0) * 100;
    case 'quality_score':
      return metrics.historical_quality_score || 0;
    case 'impressions':
      return metrics.impressions || 0;
    case 'interactions':
      return metrics.interactions || 0;
    default:
      return 0;
  }
}

/**
 * Fusionne les données actuelles et précédentes pour calculer les évolutions
 */
function mergeCurrentAndPreviousData(currentData: KPIData[], previousData: KPIData[]): KPIData[] {
  return currentData.map(current => {
    const previous = previousData.find(p => p.type === current.type);
    
    if (!previous) {
      return current;
    }
    
    const change = current.value - previous.value;
    const changePercentage = previous.value !== 0 
      ? (change / previous.value) * 100 
      : current.value > 0 ? 100 : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercentage) < 1) {
      trend = 'stable';
    } else if (changePercentage > 0) {
      trend = 'up';
    } else {
      trend = 'down';
    }
    
    return {
      ...current,
      previousValue: previous.value,
      change,
      changePercentage,
      trend,
    };
  });
}