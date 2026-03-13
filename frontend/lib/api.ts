// FastAPI backend API client
import axios from 'axios';
import { getJWT } from './appwrite';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

// Attach Appwrite JWT to every request; cancel if not authenticated
api.interceptors.request.use(async (config) => {
    const jwt = await getJWT();
    if (!jwt) {
        // No session — abort the request so we don't get a 422 from FastAPI
        const controller = new AbortController();
        controller.abort('No active session — please log in.');
        config.signal = controller.signal;
        return config;
    }
    config.headers.Authorization = `Bearer ${jwt}`;
    return config;
});

// Handle auth errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            // Token invalid/expired — redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);

// ─── Users ──────────────────────────────────────────
export const getMyProfile = () => api.get('/api/users/me').then((r) => r.data);
export const getMyStats = () => api.get('/api/users/me/stats').then((r) => r.data);
export const getMyAchievements = () => api.get('/api/users/me/achievements').then((r) => r.data);
export const getLeaderboard = (limit = 20) => api.get(`/api/users/leaderboard?limit=${limit}`).then((r) => r.data);

// ─── Modules / Scenarios ──────────────────────────
export const getModules = () => api.get('/api/modules').then((r) => r.data);
export const getScenarios = (moduleId: string) =>
    api.get(`/api/modules/${moduleId}/scenarios`).then((r) => r.data);
export const getScenario = (scenarioId: string) =>
    api.get(`/api/scenarios/${scenarioId}`).then((r) => r.data);
export const startScenario = (scenarioId: string, preferences = {}) =>
    api.post(`/api/scenarios/${scenarioId}/start`, { preferences }).then((r) => r.data);

// ─── Session ──────────────────────────────────────
export const getSession = (sessionId: string) =>
    api.get(`/api/sessions/${sessionId}`).then((r) => r.data);

// ─── Chat ─────────────────────────────────────────
export const sendChatMessage = (sessionId: string, message: string) =>
    api.post('/api/chat/send', { session_id: sessionId, message }).then((r) => r.data);
export const getChatHistory = (sessionId: string) =>
    api.get(`/api/chat/history/${sessionId}`).then((r) => r.data);

// ─── Code Execution ───────────────────────────────
export const executeCode = (sessionId: string, code: string, language: string) =>
    api.post('/api/execute', { session_id: sessionId, code, language }).then((r) => r.data);

// ─── Evaluation ───────────────────────────────────
export const generateEvaluation = (sessionId: string) =>
    api.post(`/api/evaluation/${sessionId}/generate`).then((r) => r.data);
export const getEvaluation = (sessionId: string) =>
    api.get(`/api/evaluation/${sessionId}`).then((r) => r.data);

export default api;
