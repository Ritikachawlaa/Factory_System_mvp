import httpClient from './httpClient';

const animalDetectionApi = {
    // Get all animal detections
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'animal_detection', ...params } }),

    // Get detections for a specific camera
    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'animal_detection', ...params } }),

    // Get animal detection analytics
    getStats: () =>
        httpClient.get('/stats/animal_detection'),

    // Acknowledge/dismiss an animal alert
    acknowledgeAlert: (alertId) =>
        httpClient.patch(`/detections/${alertId}`, { acknowledged: true }),
};

export default animalDetectionApi;
