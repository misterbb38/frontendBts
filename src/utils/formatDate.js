// src/utils/formatDate.js
/**
 * Formate une date en format lisible
 * @param {string|Date} date - La date à formater
 * @param {Object} options - Options de formatage
 * @returns {string} La date formatée
 */
export const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString(undefined, defaultOptions);
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return '';
    }
  };
  
  /**
   * Retourne l'intervalle de temps entre deux dates en format lisible
   * @param {string|Date} startDate - Date de début
   * @param {string|Date} endDate - Date de fin
   * @returns {string} L'intervalle formaté
   */
  export const getDateInterval = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    
    try {
      const start = formatDate(startDate);
      const end = formatDate(endDate);
      return `${start} - ${end}`;
    } catch (error) {
      console.error('Erreur de formatage d\'intervalle:', error);
      return '';
    }
  };
  
  /**
   * Calcule la différence en jours entre deux dates
   * @param {string|Date} startDate - Date de début
   * @param {string|Date} endDate - Date de fin
   * @returns {number} Nombre de jours
   */
  export const getDaysDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Erreur de calcul de différence:', error);
      return 0;
    }
  };
  
  export default {
    formatDate,
    getDateInterval,
    getDaysDifference
  };