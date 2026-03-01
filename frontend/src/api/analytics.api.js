import httpClient from './httpClient';

const analyticsApi = {
    getStats: (type) => httpClient.get(`/stats/${type}`), // type: system, object_types, trends, compliance, face
    getDashboardStats: () => httpClient.get('/stats/dashboard'),
    getEvents: (days = 1) => httpClient.get('/events', { params: { days } }),
    getTodayEvents: (limit = 100) => httpClient.get('/events/today', { params: { limit } }),
    getPerformance: () => httpClient.get('/performance'),
    getDetections: (type, limit = 20) => httpClient.get('/detections', { params: { type, limit } }),
    getViolations: () => httpClient.get('/violations'),
    clearViolations: () => httpClient.delete('/violations'),
    getAuditLogs: (limit = 100) => httpClient.get('/api/audit-logs', { params: { limit } }),
};

export default analyticsApi;
