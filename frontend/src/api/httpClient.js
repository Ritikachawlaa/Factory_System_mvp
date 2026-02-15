import axios from 'axios';
import API_BASE_URL from '../config';

const httpClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
httpClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Error Handling
httpClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Dispatch logout event or redirect
            // window.location.href = '/login'; 
            // Better to handle in AuthContext, but this is a safety net
        }
        return Promise.reject(error);
    }
);

export default httpClient;
