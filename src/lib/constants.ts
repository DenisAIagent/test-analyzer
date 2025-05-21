// Constantes de l'application

// Thème MDMC
export const MDMC_THEME = {
  colors: {
    primary: '#E6232C',
    background: '#000000',
    card: '#2E2E2E',
    text: '#FFFFFF',
    lightGray: '#F5F5F5'
  },
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Inter, sans-serif'
  },
  radii: {
    md: '12px'
  },
  spacing: {
    section: '48px'
  }
} as const;

// Constantes de l'API
export const API_CONSTANTS = {
  // Limites d'appels API
  RATE_LIMITS: {
    GOOGLE_ADS: 100, // requêtes par minute
    OPENAI: 1, // requête par jour
    GOOGLE_AI: 1 // requête par jour
  },
  // Formats de date
  DATE_FORMAT: 'yyyy-MM-dd',
  DISPLAY_DATE_FORMAT: 'dd MMM yyyy',
  // Timeouts
  TIMEOUT_MS: 30000, // 30 secondes
};

// Plages de temps disponibles
export const TIME_RANGES = [
  { value: '30d', label: '30 jours' },
  { value: '14d', label: '14 jours' },
  { value: '7d', label: '7 jours' },
  { value: '3d', label: '3 derniers jours' },
  { value: '24h', label: 'Dernières 24h' },
] as const;

// Messages système
export const SYSTEM_MESSAGES = {
  ERROR: {
    NETWORK: 'Erreur de connexion réseau. Veuillez réessayer.',
    API: 'Erreur lors de la récupération des données. Veuillez réessayer.',
    AUTH: 'Session expirée. Veuillez vous reconnecter.',
    MISSING_DATA: 'Certaines données ne sont pas disponibles.',
    AI_ANALYSIS: 'L\'analyse IA n\'a pas pu être générée. Vous pouvez réessayer manuellement.',
  },
  SUCCESS: {
    DATA_LOADED: 'Données chargées avec succès.',
    ANALYSIS_READY: 'Analyse IA terminée avec succès.',
    EXPORT_READY: 'Exportation PDF terminée avec succès.',
  },
  INFO: {
    LOADING: 'Chargement en cours...',
    ANALYZING: 'Analyse en cours...',
    EXPORTING: 'Exportation en cours...',
  },
} as const;