import httpClient from './httpClient';

const labourCountingApi = {
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'labour_counting', ...params } }),

    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'labour_counting', ...params } }),

    getStats: () =>
        httpClient.get('/stats/labour_counting'),
};

export default labourCountingApi;
