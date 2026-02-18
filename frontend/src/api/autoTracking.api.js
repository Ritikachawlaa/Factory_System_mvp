import httpClient from './httpClient';

const autoTrackingApi = {
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'auto_tracking', ...params } }),

    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'auto_tracking', ...params } }),

    getStats: () =>
        httpClient.get('/stats/auto_tracking'),
};

export default autoTrackingApi;
