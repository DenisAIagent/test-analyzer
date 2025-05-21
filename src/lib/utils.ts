import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { KPIType, KPIConfig, kpiConfig } from '../types/kpi';
import { API_CONSTANTS } from './constants';

/**
 * Formate une valeur en fonction du type de KPI
 * @param value Valeur à formater
 * @param type Type de KPI
 * @returns Valeur formatée
 */
export function formatValue(value: number, type: KPIType): string {
  const config = kpiConfig[type];
  
  if (!config) {
    return value.toString();
  }
  
  switch (config.format) {
    case 'number':
      return new Intl.NumberFormat('fr-FR').format(value);
    case 'percentage':
      return new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);
    case 'currency':
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
    case 'duration':
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      const seconds = Math.floor(value % 60);
      return `${hours}h ${minutes}m ${seconds}s`;
    case 'x':
      return `${value.toFixed(2)}x`;
    default:
      return value.toString();
  }
}

/**
 * Calcule le pourcentage de changement entre deux valeurs
 * @param current Valeur actuelle
 * @param previous Valeur précédente
 * @returns Pourcentage de changement
 */
export function calculateChangePercentage(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Détermine si un changement est positif ou négatif en fonction du type de KPI
 * @param change Valeur du changement
 * @param type Type de KPI
 * @returns true si le changement est positif
 */
export function isPositiveChange(change: number, type: KPIType): boolean {
  const config = kpiConfig[type];
  if (!config) return change > 0;
  
  return config.trend === 'up-good' ? change > 0 : change < 0;
}

/**
 * Formate une date selon le format d'affichage défini
 * @param dateString Chaîne de date ISO
 * @returns Date formatée
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, API_CONSTANTS.DISPLAY_DATE_FORMAT, { locale: fr });
}

/**
 * Tronque un texte à une longueur donnée
 * @param text Texte à tronquer
 * @param maxLength Longueur maximale
 * @returns Texte tronqué
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Génère une couleur aléatoire
 * @returns Couleur hexadécimale
 */
export function getRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

/**
 * Retarde l'exécution d'une fonction (utiliser avec await)
 * @param ms Délai en millisecondes
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Vérifie si une chaîne est un JSON valide
 * @param str Chaîne à vérifier
 * @returns true si la chaîne est un JSON valide
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Génère un ID unique
 * @returns ID unique
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}