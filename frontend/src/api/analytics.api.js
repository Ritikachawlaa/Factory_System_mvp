import httpClient from './httpClient';

const analyticsApi = {
    getStats: (type) => httpClient.get(`/stats/${type}`), // type: system, object_types, trends, compliance, face
    getEvents: () => httpClient.get('/events'),
    getPerformance: () => httpClient.get('/performance'),
    getDetections: (type, limit = 20) => httpClient.get('/detections', { params: { type, limit } }),
    getViolations: () => httpClient.get('/violations'),
    clearViolations: () => httpClient.delete('/violations'),
};

export default analyticsApi;
