import httpClient from './httpClient';

const humanDetectionApi = {
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'human_detection', ...params } }),

    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'human_detection', ...params } }),

    getStats: () =>
        httpClient.get('/stats/human_detection'),

    acknowledgeAlert: (alertId) =>
        httpClient.patch(`/detections/${alertId}`, { acknowledged: true }),
};

export default humanDetectionApi;
