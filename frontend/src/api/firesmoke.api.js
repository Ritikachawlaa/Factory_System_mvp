import httpClient from './httpClient';

const fireSmokeApi = {
    // Get all fire/smoke detections
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'fire_smoke', ...params } }),

    // Get fire/smoke detections for a specific camera
    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'fire_smoke', ...params } }),

    // Get fire/smoke analytics/stats
    getStats: () =>
        httpClient.get('/stats/fire_smoke'),

    // Acknowledge/dismiss a fire/smoke alert
    acknowledgeAlert: (alertId) =>
        httpClient.patch(`/detections/${alertId}`, { acknowledged: true }),
};

export default fireSmokeApi;
