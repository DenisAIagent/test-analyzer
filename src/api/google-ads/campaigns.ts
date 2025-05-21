// Fonctions pour récupérer les campagnes Google Ads
import { getGoogleAdsClient } from './client';
import { Campaign, CampaignType, CampaignDetails } from '../../types/campaign';

/**
 * Transforme le type de campagne Google Ads en CampaignType
 * @param googleCampaignType Type de campagne Google Ads
 * @returns Le type de campagne standardisé
 */
function mapCampaignType(googleCampaignType: string): CampaignType {
  if (googleCampaignType.includes('PERFORMANCE_MAX')) {
    return 'PERFORMANCE_MAX';
  } else if (googleCampaignType.includes('VIDEO')) {
    return 'VIDEO';
  } else if (googleCampaignType.includes('SEARCH')) {
    return 'SEARCH';
  } else {
    return 'DISPLAY';
  }
}

/**
 * Récupère toutes les campagnes actives pour un client
 * @param customerId ID du client Google Ads
 * @returns Liste des campagnes
 */
export async function getCampaigns(customerId: string): Promise<Campaign[]> {
  try {
    const client = getGoogleAdsClient();
    
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.advertising_channel_sub_type,
        campaign.start_date
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      ORDER BY campaign.name
    `;
    
    const results = await client.query(customerId, query);
    
    return results.map((result: any) => {
      const campaign = result.campaign;
      
      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        type: mapCampaignType(campaign.advertisingChannelType + '_' + (campaign.advertisingChannelSubType || '')),
        startDate: campaign.startDate,
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des campagnes:', error);
    throw error;
  }
}

/**
 * Récupère les détails d'une campagne spécifique
 * @param customerId ID du client Google Ads
 * @param campaignId ID de la campagne
 * @returns Détails de la campagne
 */
export async function getCampaignDetails(customerId: string, campaignId: string): Promise<CampaignDetails | null> {
  try {
    const client = getGoogleAdsClient();
    
    // Requête pour obtenir les détails de la campagne
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.advertising_channel_sub_type,
        campaign.start_date,
        campaign.end_date,
        campaign.bidding_strategy_type,
        campaign.target_roas,
        campaign.target_cpa,
        campaign_budget.amount_micros
      FROM campaign
      WHERE campaign.id = ${campaignId}
      LIMIT 1
    `;
    
    const results = await client.query(customerId, query);
    
    if (results.length === 0) {
      return null;
    }
    
    const result = results[0];
    const campaign = result.campaign;
    
    // Requête pour obtenir le nombre de groupes d'annonces
    const adGroupsQuery = `
      SELECT
        ad_group.id
      FROM ad_group
      WHERE ad_group.campaign.id = ${campaignId}
    `;
    
    const adGroupsResults = await client.query(customerId, adGroupsQuery);
    
    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      type: mapCampaignType(campaign.advertisingChannelType + '_' + (campaign.advertisingChannelSubType || '')),
      startDate: campaign.startDate,
      budget: result.campaignBudget ? {
        amount: result.campaignBudget.amountMicros / 1000000,
        type: 'DAILY',
      } : undefined,
      biddingStrategy: campaign.biddingStrategyType,
      adGroups: adGroupsResults.length,
      lastModified: new Date().toISOString(), // À remplacer par la vraie date si disponible dans l'API
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails de la campagne ${campaignId}:`, error);
    throw error;
  }
}

/**
 * Récupère les modifications récentes d'une campagne (simule l'API)
 * @param customerId ID du client Google Ads
 * @param campaignId ID de la campagne
 * @returns Dernières modifications
 */
export async function getCampaignModifications(customerId: string, campaignId: string): Promise<any[]> {
  // Note: L'API Google Ads ne fournit pas facilement cette information
  // Cette fonction simule les données pour la démonstration
  
  return [
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'BUDGET',
      description: 'Augmentation du budget journalier de 50€ à 80€',
    },
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'CREATIVE',
      description: 'Mise à jour des annonces vidéo et ajout de 2 nouvelles variantes',
    },
    {
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'TARGETING',
      description: 'Expansion du ciblage démographique pour inclure 18-24 ans',
    },
  ];
}