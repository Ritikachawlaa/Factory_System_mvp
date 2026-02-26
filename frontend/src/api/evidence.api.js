import httpClient from './httpClient';

const evidenceApi = {
    getAll: () => httpClient.get('/evidence'),
    delete: (id) => httpClient.delete(`/evidence/${id}`),
    // Optional: If we had an upload, create method here
};

export default evidenceApi;
