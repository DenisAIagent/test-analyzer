// Types pour les campagnes Google Ads

export type CampaignType = 
  | 'PERFORMANCE_MAX' 
  | 'VIDEO' 
  | 'SEARCH' 
  | 'DISPLAY';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  startDate?: string;
  budget?: {
    amount: number;
    type: 'DAILY' | 'TOTAL';
  };
  biddingStrategy?: string;
}

export interface CampaignDetails extends Campaign {
  lastModified?: string;
  adGroups?: number;
  targetAudiences?: string[];
  location?: string[];
  device?: string[];
  language?: string[];
}

export type TimeRange = '30d' | '14d' | '7d' | '3d' | '24h';

export interface DateRange {
  startDate: string;
  endDate: string;
}

// Fonction pour obtenir un intervalle de dates à partir d'une plage de temps
export function getDateRangeFromTimeRange(timeRange: TimeRange): DateRange {
  const endDate = new Date();
  let startDate = new Date();
  
  switch(timeRange) {
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '14d':
      startDate.setDate(endDate.getDate() - 14);
      break;
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '3d':
      startDate.setDate(endDate.getDate() - 3);
      break;
    case '24h':
      startDate.setDate(endDate.getDate() - 1);
      break;
  }
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}