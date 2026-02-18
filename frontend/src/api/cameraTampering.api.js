import httpClient from './httpClient';

const cameraTamperingApi = {
    // Get all camera tampering detections
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'camera_tampering', ...params } }),

    // Get detections for a specific camera
    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'camera_tampering', ...params } }),

    // Get camera tampering analytics
    getStats: () =>
        httpClient.get('/stats/camera_tampering'),

    // Acknowledge/dismiss a tampering alert
    acknowledgeAlert: (alertId) =>
        httpClient.patch(`/detections/${alertId}`, { acknowledged: true }),
};

export default cameraTamperingApi;
