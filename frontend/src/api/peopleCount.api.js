import httpClient from './httpClient';

const peopleCountApi = {
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'people-count', ...params } }),

    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'people-count', ...params } }),

    getStats: () =>
        httpClient.get('/stats/people-count'),

    acknowledgeAlert: (alertId) =>
        httpClient.patch(`/detections/${alertId}`, { acknowledged: true }),
};

export default peopleCountApi;
