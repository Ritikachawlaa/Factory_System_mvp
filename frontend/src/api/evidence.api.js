import httpClient from './httpClient';

const evidenceApi = {
    getAll: async () => {
        const response = await httpClient.get('/evidence');
        return response.data;
    },
    delete: async (id) => {
        const response = await httpClient.delete(`/evidence/${id}`);
        return response.data;
    },
    // Optional: If we had an upload, create method here
};

export default evidenceApi;
