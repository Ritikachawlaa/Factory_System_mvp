import httpClient from './httpClient';

const faultDetectionApi = {
    // Get all fault detections
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'fault_detection', ...params } }),

    // Get detections for a specific camera
    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'fault_detection', ...params } }),

    // Get fault detection analytics
    getStats: () =>
        httpClient.get('/stats/fault_detection'),

    // Acknowledge/dismiss a fault alert
    acknowledgeAlert: (alertId) =>
        httpClient.patch(`/detections/${alertId}`, { acknowledged: true }),
};

export default faultDetectionApi;
