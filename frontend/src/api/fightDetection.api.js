import httpClient from './httpClient';

const fightDetectionApi = {
    // Get all fight detections
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'fight_detection', ...params } }),

    // Get detections for a specific camera
    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'fight_detection', ...params } }),

    // Get fight detection analytics
    getStats: () =>
        httpClient.get('/stats/fight_detection'),

    // Acknowledge/dismiss a fight alert
    acknowledgeAlert: (alertId) =>
        httpClient.patch(`/detections/${alertId}`, { acknowledged: true }),
};

export default fightDetectionApi;
