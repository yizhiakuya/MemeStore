import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { Meme, Tag, Category, LoginFormData, RegisterFormData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 登录和注册请求失败时不进行token刷新，直接返回错误
        if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                localStorage.setItem('accessToken', data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                return apiClient(originalRequest);
            } catch (err) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export const memeAPI = {
    getAll: (params?: Record<string, any>) => apiClient.get<{ data: Meme[] }>('/memes', { params }),
    getById: (id: string) => apiClient.get<Meme>(`/memes/${id}`),
    create: (formData: FormData) => apiClient.post<Meme>('/memes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id: string, data: Partial<Meme>) => apiClient.put<Meme>(`/memes/${id}`, data),
    delete: (id: string) => apiClient.delete(`/memes/${id}`),
};

export const tagAPI = {
    getAll: () => apiClient.get<Tag[]>('/tags'),
};

export const categoryAPI = {
    getAll: () => apiClient.get<Category[]>('/categories'),
};

export const authAPI = {
    register: (credentials: RegisterFormData) => apiClient.post('/auth/register', credentials),
    login: (credentials: LoginFormData) => apiClient.post('/auth/login', credentials),
    logout: () => apiClient.post('/auth/logout'),
    refresh: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
};

export const statsAPI = {
    get: () => apiClient.get('/stats'),
};

export default apiClient;
