import axios, { AxiosInstance } from 'axios';
import type { Meme, Tag, Category } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

export const statsAPI = {
    get: () => apiClient.get('/stats'),
};

export default apiClient;
