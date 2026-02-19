import httpClient from './httpClient';

const camerasApi = {
    getAll: () => httpClient.get('/cameras'),
    // Support fetching single camera if backend supports it, otherwise find in list
    getById: async (id) => {
        const cameras = await httpClient.get('/cameras');
        return cameras.find(c => c.id === parseInt(id));
    },
    create: (cameraData) => httpClient.post('/cameras', cameraData),
    update: (id, cameraData) => httpClient.put(`/cameras/${id}`, cameraData),
    delete: (id) => httpClient.delete(`/cameras/${id}`),
    updateModule: (cameraId, moduleKey, data) => httpClient.post(`/cameras/${cameraId}/modules/${moduleKey}`, data),
};

export default camerasApi;
