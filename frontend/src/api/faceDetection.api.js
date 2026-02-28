import httpClient from './httpClient';

const faceDetectionApi = {
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'face-detection', ...params } }),

    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'face-detection', ...params } }),

    getStats: () =>
        httpClient.get('/stats/face'),

    acknowledgeAlert: (alertId) =>
        httpClient.patch(`/detections/${alertId}`, { acknowledged: true }),
};

export default faceDetectionApi;
