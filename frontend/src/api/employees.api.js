import httpClient from './httpClient';

// Currently leveraging the /employees endpoints effectively
const employeesApi = {
    getAll: () => httpClient.get('/employees'),
    create: (formData) => httpClient.post('/employees', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, name) => httpClient.put(`/employees/${id}`, { name }),
    delete: (id) => httpClient.delete(`/employees/${id}`),
};

export default employeesApi;
