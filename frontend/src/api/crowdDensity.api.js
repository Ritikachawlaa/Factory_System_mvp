import httpClient from './httpClient';

const crowdDensityApi = {
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'crowd_density', ...params } }),

    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'crowd_density', ...params } }),

    getStats: () =>
        httpClient.get('/stats/crowd_density'),

    acknowledgeAlert: (alertId) =>
        httpClient.patch(`/detections/${alertId}`, { acknowledged: true }),
};

export default crowdDensityApi;
