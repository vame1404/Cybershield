/**
 * CyberShield AI - API Service
 * Handles all communication with the backend
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for ML inference
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ============================================
// Dashboard API
// ============================================

export const dashboardAPI = {
  getStats: () => api.get('/api/v1/dashboard/stats'),
  getModules: () => api.get('/api/v1/dashboard/modules'),
  getTrends: () => api.get('/api/v1/dashboard/trends'),
  getRiskDistribution: () => api.get('/api/v1/dashboard/risk-distribution'),
  getRecentDetections: () => api.get('/api/v1/dashboard/recent-detections'),
  getUnifiedRiskScore: () => api.get('/api/v1/dashboard/unified-risk-score'),
}

export const commonAPI = {
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/v1/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    })
  }
}

// ============================================
// Deepfake Detection API
// ============================================

export const deepfakeAPI = {
  analyzeImage: (urls) => {
    return api.post('/api/v1/deepfake/analyze/image', { urls })
  },
  analyzeVideo: (url) => {
    return api.post('/api/v1/deepfake/analyze/video', { url })
  },
  getStats: () => api.get('/api/v1/deepfake/stats'),
  getModelInfo: () => api.get('/api/v1/deepfake/model-info'),
}

// ============================================
// Phishing Detection API
// ============================================

export const phishingAPI = {
  analyze: (url) => api.post('/api/v1/phishing/analyze', { url }),
  analyzeBulk: (urls) => api.post('/api/v1/phishing/analyze/bulk', urls),
  getStats: () => api.get('/api/v1/phishing/stats'),
  getRecentThreats: () => api.get('/api/v1/phishing/recent-threats'),
}

// ============================================
// AML Detection API
// ============================================

export const amlAPI = {
  analyze: (transaction) =>
    api.post('/api/v1/aml/analyze', transaction),
  analyzeBatch: (transactions) =>
    api.post('/api/v1/aml/analyze/batch', transactions),
  getStats: () => api.get('/api/v1/aml/stats'),
  getPatterns: () => api.get('/api/v1/aml/patterns'),
  getAlerts: () => api.get('/api/v1/aml/alerts'),
}

// ============================================
// Alerts API
// ============================================

export const alertsAPI = {
  getAll: (params) => api.get('/api/v1/alerts', { params }),
  getStats: () => api.get('/api/v1/alerts/stats'),
  getById: (id) => api.get(`/api/v1/alerts/${id}`),
  update: (id, data) => api.patch(`/api/v1/alerts/${id}`, data),
  delete: (id) => api.delete(`/api/v1/alerts/${id}`),
  resolve: (id) => api.post(`/api/v1/alerts/${id}/resolve`),
  getByModule: () => api.get('/api/v1/alerts/summary/by-module'),
  getTimeline: () => api.get('/api/v1/alerts/summary/timeline'),
}

// ============================================
// New API Endpoints (CyberShield 2 Integration)
// ============================================

export const creditCardAPI = {
  analyzeCSV: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/v1/credit-card/analyze/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const aiGeneratedAPI = {
  analyzeImage: (urls) => {
    return api.post('/api/v1/ai-generated/analyze/image', { urls })
  },
}

export const documentAPI = {
  analyzeImage: (files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post('/api/v1/fake-document/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const aiGeneratedVideoAPI = {
    analyzeVideo: (url) => {
        return api.post('/api/v1/ai-generated/analyze/video', { url })
    }
}

export const statsAPI = {
  get: () => api.get('/api/v1/stats')
}

// ============================================
// Health Check
// ============================================

export const healthAPI = {
  check: () => api.get('/health'),
  root: () => api.get('/'),
}

export default api

