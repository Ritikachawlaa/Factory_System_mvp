import httpClient from './httpClient';

const faceRecognitionApi = {
    getDetections: (params = {}) =>
        httpClient.get('/detections', { params: { type: 'face-recognition', ...params } }),

    getStats: () =>
        httpClient.get('/stats/face'), // Reusing face stats or we can have a specific one if needed

    getRecognizedToday: () =>
        httpClient.get('/detections', { params: { type: 'face-recognition', limit: 100 } }),
};

export default faceRecognitionApi;
