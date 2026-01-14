const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal ? 'http://localhost:8000' : 'https://1326044526d4.ngrok-free.app';
export default API_BASE_URL;
