import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://projectmanagementserver.vercel.app'),
})

export default api;