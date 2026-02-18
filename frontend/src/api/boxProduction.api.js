import httpClient from './httpClient';

const boxProductionApi = {
    // Get all box production detections/counts
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'box_production', ...params } }),

    // Get detections for a specific camera
    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'box_production', ...params } }),

    // Get production stats (counts, trends)
    getStats: () =>
        httpClient.get('/stats/box_production'),
};

export default boxProductionApi;
