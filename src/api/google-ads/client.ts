// Client API Google Ads avec authentification
import axios, { AxiosInstance } from 'axios';
import { API_CONSTANTS } from '../../lib/constants';

// Types pour la configuration du client
interface GoogleAdsClientConfig {
  clientId: string;
  developerToken: string;
  refreshToken: string;
  clientSecret?: string;
  loginCustomerId?: string;
}

class GoogleAdsClient {
  private axiosInstance: AxiosInstance;
  private config: GoogleAdsClientConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: GoogleAdsClientConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: 'https://googleads.googleapis.com/v14',
      timeout: API_CONSTANTS.TIMEOUT_MS,
    });

    // Intercepteur pour ajouter le token d'authentification
    this.axiosInstance.interceptors.request.use(async (config) => {
      // Vérifie si le token est expiré et le régénère si nécessaire
      if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
        await this.refreshAccessToken();
      }

      config.headers.Authorization = `Bearer ${this.accessToken}`;
      config.headers['developer-token'] = this.config.developerToken;
      
      if (this.config.loginCustomerId) {
        config.headers['login-customer-id'] = this.config.loginCustomerId;
      }
      
      return config;
    });
  }

  // Méthode pour rafraîchir le token d'accès
  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token',
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + response.data.expires_in * 1000;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw new Error('Échec de l\'authentification Google Ads');
    }
  }

  // Méthode pour exécuter une requête GAQL (Google Ads Query Language)
  public async query(customerId: string, query: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post(
        `/customers/${customerId}/googleAds:search`,
        { query }
      );
      return response.data.results || [];
    } catch (error) {
      console.error('Erreur lors de la requête Google Ads:', error);
      throw error;
    }
  }

  // Méthode pour obtenir les informations du compte
  public async getAccountInfo(customerId: string): Promise<any> {
    try {
      const query = `
        SELECT
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone
        FROM customer
        LIMIT 1
      `;
      
      const results = await this.query(customerId, query);
      return results[0]?.customer || null;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations du compte:', error);
      throw error;
    }
  }
}

// Singleton pour éviter de créer plusieurs instances
let clientInstance: GoogleAdsClient | null = null;

// Fonction pour obtenir l'instance du client
export function getGoogleAdsClient(config?: GoogleAdsClientConfig): GoogleAdsClient {
  if (!clientInstance && config) {
    clientInstance = new GoogleAdsClient(config);
  } else if (!clientInstance && !config) {
    throw new Error('La configuration Google Ads est requise pour initialiser le client');
  }
  
  return clientInstance as GoogleAdsClient;
}

// Fonction pour réinitialiser le client (utile pour les tests ou changement de compte)
export function resetGoogleAdsClient(): void {
  clientInstance = null;
}

export default GoogleAdsClient;