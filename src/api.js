// Configuration de base pour les appels API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Gestionnaire pour ajouter le token JWT aux headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Fonction fetch générique avec gestion des erreurs
const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;

    // Fusion des headers par défaut avec ceux fournis
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        // Si la réponse n'est pas ok (2xx), on lance une erreur
        if (!response.ok) {
            // Gestion spécifique pour 401 (non authentifié)
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }

            // Essayer d'extraire le message d'erreur de la réponse JSON
            const errorData = await response.json().catch(() => null);
            throw new Error(
                errorData?.message || `Erreur ${response.status}: ${response.statusText}`
            );
        }

        // Si la réponse est vide ou pas du JSON, on retourne null
        if (response.status === 204) return null;

        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
};

// Méthodes d'API pour différentes requêtes HTTP
export default {
    get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
    post: (endpoint, data) => apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    put: (endpoint, data) => apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};