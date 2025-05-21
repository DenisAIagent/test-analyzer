import React, { useState, useEffect, useContext, createContext } from 'react';
import { Campaign, CampaignDetails, TimeRange, getDateRangeFromTimeRange } from '../types/campaign';
import { KPIData, KPIHistoryData, campaignTypeToKPI } from '../types/kpi';
import { getCampaigns, getCampaignDetails } from '../api/google-ads/campaigns';
import { getCampaignPerformance, getCampaignHistoricalPerformance } from '../api/google-ads/reports';

// Interface pour le contexte
interface CampaignContextType {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  campaignDetails: CampaignDetails | null;
  kpiData: Record<TimeRange, KPIData[]>;
  chartData: Record<TimeRange, KPIHistoryData[]>;
  selectedTimeRange: TimeRange;
  isLoading: boolean;
  error: string | null;
  selectCampaign: (campaign: Campaign) => void;
  setSelectedTimeRange: (timeRange: TimeRange) => void;
  refreshData: () => Promise<void>;
}

// Mock data pour le développement local
const MOCK_CUSTOMER_ID = '1234567890';

// Création du contexte
const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

// Provider du contexte
export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails | null>(null);
  const [kpiData, setKpiData] = useState<Record<TimeRange, KPIData[]>>({
    '30d': [],
    '14d': [],
    '7d': [],
    '3d': [],
    '24h': [],
  });
  const [chartData, setChartData] = useState<Record<TimeRange, KPIHistoryData[]>>({
    '30d': [],
    '14d': [],
    '7d': [],
    '3d': [],
    '24h': [],
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('7d');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Récupération des campagnes au chargement initial
  useEffect(() => {
    // Au démarrage, récupérer la liste des campagnes
    fetchCampaigns();
  }, []);

  // Récupération des détails de la campagne sélectionnée
  useEffect(() => {
    if (selectedCampaign) {
      fetchCampaignDetails(selectedCampaign.id);
    }
  }, [selectedCampaign]);

  // Fonction pour récupérer la liste des campagnes
  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // En développement, utiliser des données mockées
      if (process.env.NODE_ENV === 'development') {
        // Simule un délai réseau
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockCampaigns: Campaign[] = [
          { id: '1001', name: 'Campagne YouTube - Artiste XYZ', type: 'VIDEO', status: 'ENABLED' },
          { id: '1002', name: 'Performance Max - Label ABC', type: 'PERFORMANCE_MAX', status: 'ENABLED' },
          { id: '1003', name: 'Search - Vente Albums 2024', type: 'SEARCH', status: 'ENABLED' },
          { id: '1004', name: 'Display - Promo EP', type: 'DISPLAY', status: 'PAUSED' },
          { id: '1005', name: 'YouTube - Lives Automne', type: 'VIDEO', status: 'ENABLED' },
        ];
        
        setCampaigns(mockCampaigns);
        
        // Sélectionner la première campagne par défaut si aucune n'est sélectionnée
        if (mockCampaigns.length > 0 && !selectedCampaign) {
          setSelectedCampaign(mockCampaigns[0]);
        }
      } else {
        // En production, appeler l'API réelle
        const fetchedCampaigns = await getCampaigns(MOCK_CUSTOMER_ID);
        setCampaigns(fetchedCampaigns);
        
        if (fetchedCampaigns.length > 0 && !selectedCampaign) {
          setSelectedCampaign(fetchedCampaigns[0]);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des campagnes:', err);
      setError('Impossible de récupérer les campagnes. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer les détails d'une campagne
  const fetchCampaignDetails = async (campaignId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // En développement, utiliser des données mockées
      if (process.env.NODE_ENV === 'development') {
        // Simule un délai réseau
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockDetails: CampaignDetails = {
          id: campaignId,
          name: selectedCampaign?.name || '',
          type: selectedCampaign?.type || 'VIDEO',
          status: selectedCampaign?.status || 'ENABLED',
          startDate: '2025-01-15',
          budget: {
            amount: 100,
            type: 'DAILY',
          },
          biddingStrategy: 'MAXIMIZE_CONVERSIONS',
          adGroups: 3,
          targetAudiences: ['Fans de musique', '18-34 ans', 'Urbain'],
          lastModified: new Date().toISOString(),
        };
        
        setCampaignDetails(mockDetails);
        
        // Récupérer les données KPI pour chaque plage de temps
        await fetchKPIData(campaignId, selectedCampaign?.type || 'VIDEO');
      } else {
        // En production, appeler l'API réelle
        const details = await getCampaignDetails(MOCK_CUSTOMER_ID, campaignId);
        setCampaignDetails(details);
        
        if (details) {
          await fetchKPIData(campaignId, details.type);
        }
      }
    } catch (err) {
      console.error(`Erreur lors de la récupération des détails de la campagne ${campaignId}:`, err);
      setError('Impossible de récupérer les détails de la campagne. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer les données KPI pour toutes les plages de temps
  const fetchKPIData = async (campaignId: string, campaignType: Campaign['type']) => {
    const timeRanges: TimeRange[] = ['30d', '14d', '7d', '3d', '24h'];
    const kpiTypes = campaignTypeToKPI[campaignType];
    
    const newKpiData: Record<TimeRange, KPIData[]> = {
      '30d': [],
      '14d': [],
      '7d': [],
      '3d': [],
      '24h': [],
    };
    
    const newChartData: Record<TimeRange, KPIHistoryData[]> = {
      '30d': [],
      '14d': [],
      '7d': [],
      '3d': [],
      '24h': [],
    };
    
    try {
      // Pour chaque plage de temps, récupérer les données
      for (const timeRange of timeRanges) {
        const dateRange = getDateRangeFromTimeRange(timeRange);
        
        // En développement, utiliser des données mockées
        if (process.env.NODE_ENV === 'development') {
          // Simule un délai réseau
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Générer des données KPI aléatoires pour le test
          const mockKpiData: KPIData[] = kpiTypes.map(type => ({
            type,
            value: Math.random() * 1000,
            previousValue: Math.random() * 1000,
            changePercentage: Math.random() * 40 - 20, // Entre -20% et +20%
            trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
            timeRange,
          }));
          
          newKpiData[timeRange] = mockKpiData;
          
          // Générer des données historiques aléatoires pour les graphiques
          const days = timeRange === '30d' ? 30 : timeRange === '14d' ? 14 : timeRange === '7d' ? 7 : timeRange === '3d' ? 3 : 1;
          
          const mockChartData: KPIHistoryData[] = kpiTypes.map(type => ({
            type,
            data: Array.from({ length: days }, (_, i) => ({
              date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              value: Math.random() * 1000,
            })),
            timeRange,
          }));
          
          newChartData[timeRange] = mockChartData;
        } else {
          // En production, appeler l'API réelle
          const kpiResults = await getCampaignPerformance(
            MOCK_CUSTOMER_ID,
            campaignId,
            dateRange,
            campaignType
          );
          
          newKpiData[timeRange] = kpiResults;
          
          const chartResults = await getCampaignHistoricalPerformance(
            MOCK_CUSTOMER_ID,
            campaignId,
            dateRange,
            kpiTypes
          );
          
          newChartData[timeRange] = chartResults;
        }
      }
      
      setKpiData(newKpiData);
      setChartData(newChartData);
    } catch (err) {
      console.error(`Erreur lors de la récupération des KPI pour la campagne ${campaignId}:`, err);
      setError('Impossible de récupérer les données de performance. Veuillez réessayer.');
    }
  };

  // Fonction pour sélectionner une campagne
  const selectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    if (selectedCampaign) {
      await fetchCampaignDetails(selectedCampaign.id);
    } else {
      await fetchCampaigns();
    }
  };

  // Valeur du contexte
  const value: CampaignContextType = {
    campaigns,
    selectedCampaign,
    campaignDetails,
    kpiData,
    chartData,
    selectedTimeRange,
    isLoading,
    error,
    selectCampaign,
    setSelectedTimeRange,
    refreshData,
  };

  return React.createElement(CampaignContext.Provider, { value }, children);
}

// Hook pour utiliser le contexte
export function useCampaign(): CampaignContextType {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}