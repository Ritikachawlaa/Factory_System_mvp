import httpClient from './httpClient';

const authApi = {
    login: async (username, password) => {
        // OAuth2PasswordRequestForm expects form-urlencoded data, NOT multipart/form-data
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        return httpClient.post('/token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    },
    getCurrentUser: () => httpClient.get('/users/me'),
    getAllUsers: () => httpClient.get('/users'),
    createUser: (userData) => httpClient.post('/users', userData),
    deleteUser: (username) => httpClient.delete(`/users/${username}`),
    updatePassword: (username, newPassword) => httpClient.put(`/users/${username}/password`, { new_password: newPassword }),
};

export default authApi;
