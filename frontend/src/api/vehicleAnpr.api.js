import httpClient from './httpClient';

const vehicleAnprApi = {
    // Get all vehicle/ANPR detections
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'vehicle_anpr', ...params } }),

    // Get detections for a specific camera
    getForCamera: (cameraId, params = {}) =>
        httpClient.get(`/cameras/${cameraId}/detections`, { params: { type: 'vehicle_anpr', ...params } }),

    // Get vehicle/ANPR analytics
    getStats: () =>
        httpClient.get('/stats/vehicle_anpr'),

    // Search by license plate
    searchPlate: (plateNumber) =>
        httpClient.get('/detections', { params: { type: 'vehicle_anpr', plate: plateNumber } }),
};

export default vehicleAnprApi;
