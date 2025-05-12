// src/lib/api.js
import axios from 'axios';

// Créer une instance axios avec une configuration de base
const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gérer l'expiration du token
    if (error.response && error.response.status === 401) {
      // Si la réponse est 401 Unauthorized, le token est probablement expiré
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Rediriger vers la page de connexion si nécessaire
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Fonctions utilitaires pour les appels API courants
const apiService = {
  // Authentification
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Échec de la connexion',
      };
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Échec de l\'inscription',
      };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  
  // Projets
  getProjects: async () => {
    return await api.get('/projets');
  },
  
  getProjectById: async (id) => {
    return await api.get(`/projets/${id}`);
  },
  
  createProject: async (projectData) => {
    return await api.post('/projets', projectData);
  },
  
  updateProject: async (id, projectData) => {
    return await api.put(`/projets/${id}`, projectData);
  },
  
  deleteProject: async (id) => {
    return await api.delete(`/projets/${id}`);
  },
  
  // Ouvriers
  getWorkers: async () => {
    return await api.get('/ouvriers');
  },
  
  getWorkerById: async (id) => {
    return await api.get(`/ouvriers/${id}`);
  },
  
  createWorker: async (workerData) => {
    return await api.post('/ouvriers', workerData);
  },
  
  updateWorker: async (id, workerData) => {
    return await api.put(`/ouvriers/${id}`, workerData);
  },
  
  deleteWorker: async (id) => {
    return await api.delete(`/ouvriers/${id}`);
  },
  
  // Matériaux
  getMaterials: async () => {
    return await api.get('/materiaux');
  },
  
  getMaterialById: async (id) => {
    return await api.get(`/materiaux/${id}`);
  },
  
  createMaterial: async (materialData) => {
    return await api.post('/materiaux', materialData);
  },
  
  updateMaterial: async (id, materialData) => {
    return await api.put(`/materiaux/${id}`, materialData);
  },
  
  deleteMaterial: async (id) => {
    return await api.delete(`/materiaux/${id}`);
  },
  
  // Transactions
  getTransactions: async () => {
    return await api.get('/transactions');
  },
  
  getTransactionById: async (id) => {
    return await api.get(`/transactions/${id}`);
  },
  
  createTransaction: async (transactionData) => {
    return await api.post('/transactions', transactionData);
  },
  
  updateTransaction: async (id, transactionData) => {
    return await api.put(`/transactions/${id}`, transactionData);
  },
  
  deleteTransaction: async (id) => {
    return await api.delete(`/transactions/${id}`);
  },
  
  // Tâches
  getTasks: async () => {
    return await api.get('/taches');
  },
  
  getTaskById: async (id) => {
    return await api.get(`/taches/${id}`);
  },
  
  createTask: async (taskData) => {
    return await api.post('/taches', taskData);
  },
  
  updateTask: async (id, taskData) => {
    return await api.put(`/taches/${id}`, taskData);
  },
  
  updateTaskStatus: async (id, status) => {
    return await api.put(`/taches/${id}/statut`, { statut: status });
  },
  
  deleteTask: async (id) => {
    return await api.delete(`/taches/${id}`);
  },
  
  // Commentaires de tâches
  addTaskComment: async (taskId, commentData) => {
    return await api.post(`/taches/${taskId}/commentaires`, commentData);
  },
  
  deleteTaskComment: async (taskId, commentId) => {
    return await api.delete(`/taches/${taskId}/commentaires/${commentId}`);
  },
  
  // Notifications
  getNotifications: async () => {
    return await api.get('/notifications');
  },
  
  markNotificationAsRead: async (id) => {
    return await api.put(`/notifications/${id}/read`);
  },
  
  markAllNotificationsAsRead: async () => {
    return await api.put('/notifications/read-all');
  },
  
  deleteNotification: async (id) => {
    return await api.delete(`/notifications/${id}`);
  },
  
  // Statistiques
  getDashboardStats: async () => {
    return await api.get('/stats/dashboard');
  },
  
  getProjectStats: async (projectId) => {
    return await api.get(`/stats/projets/${projectId}`);
  },
  
  getFinancialStats: async (period) => {
    return await api.get(`/stats/finances?period=${period}`);
  },
  
  // Gestion des paiements 
  getPayments: async () => {
    return await api.get('/paiements');
  },
  
  getPaymentById: async (id) => {
    return await api.get(`/paiements/${id}`);
  },
  
  createPayment: async (paymentData) => {
    return await api.post('/paiements', paymentData);
  },
  
  updatePayment: async (id, paymentData) => {
    return await api.put(`/paiements/${id}`, paymentData);
  },
  
  deletePayment: async (id) => {
    return await api.delete(`/paiements/${id}`);
  },
  
  // Utilitaires
  uploadFile: async (formData) => {
    return await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getUsers: async () => {
    return await api.get('/users');
  },
  
  getUserById: async (id) => {
    return await api.get(`/users/${id}`);
  },
};

// Export de l'instance axios pour les appels directs
export default api;

// Export des services d'API pour les appels spécifiques
export const authService = {
  login: apiService.login,
  register: apiService.register,
  logout: apiService.logout,
};

export const projectService = {
  getAll: apiService.getProjects,
  getById: apiService.getProjectById,
  create: apiService.createProject,
  update: apiService.updateProject,
  delete: apiService.deleteProject,
};

export const workerService = {
  getAll: apiService.getWorkers,
  getById: apiService.getWorkerById,
  create: apiService.createWorker,
  update: apiService.updateWorker,
  delete: apiService.deleteWorker,
};

export const materialService = {
  getAll: apiService.getMaterials,
  getById: apiService.getMaterialById,
  create: apiService.createMaterial,
  update: apiService.updateMaterial,
  delete: apiService.deleteMaterial,
};

export const transactionService = {
  getAll: apiService.getTransactions,
  getById: apiService.getTransactionById,
  create: apiService.createTransaction,
  update: apiService.updateTransaction,
  delete: apiService.deleteTransaction,
};

export const taskService = {
  getAll: apiService.getTasks,
  getById: apiService.getTaskById,
  create: apiService.createTask,
  update: apiService.updateTask,
  updateStatus: apiService.updateTaskStatus,
  delete: apiService.deleteTask,
  addComment: apiService.addTaskComment,
  deleteComment: apiService.deleteTaskComment,
};

export const notificationService = {
  getAll: apiService.getNotifications,
  markAsRead: apiService.markNotificationAsRead,
  markAllAsRead: apiService.markAllNotificationsAsRead,
  delete: apiService.deleteNotification,
};

export const statsService = {
  getDashboard: apiService.getDashboardStats,
  getProject: apiService.getProjectStats,
  getFinancial: apiService.getFinancialStats,
};

export const paymentService = {
  getAll: apiService.getPayments,
  getById: apiService.getPaymentById,
  create: apiService.createPayment,
  update: apiService.updatePayment,
  delete: apiService.deletePayment,
};

export const userService = {
  getAll: apiService.getUsers,
  getById: apiService.getUserById,
};

export const fileService = {
  upload: apiService.uploadFile,
};