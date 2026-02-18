import httpClient from './httpClient';

const faceDetectionApi = {
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'face_detection', ...params } }),

    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'face_detection', ...params } }),

    getStats: () =>
        httpClient.get('/stats/face_detection'),

    acknowledgeAlert: (alertId) =>
        httpClient.patch(`/detections/${alertId}`, { acknowledged: true }),
};

export default faceDetectionApi;
