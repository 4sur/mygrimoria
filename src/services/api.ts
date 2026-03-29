import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

export const api = {
    async get(endpoint: string) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });
        if (!response.ok) {
            const error = new Error(`API error: ${response.statusText}`);
            (error as any).status = response.status;
            throw error;
        }
        return response.json();
    },

    async post(endpoint: string, body: any) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = new Error(`API error: ${response.statusText}`);
            (error as any).status = response.status;
            throw error;
        }
        return response.json();
    },

    async put(endpoint: string, body: any) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = new Error(`API error: ${response.statusText}`);
            (error as any).status = response.status;
            throw error;
        }
        return response.json();
    },

    async delete(endpoint: string) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) {
            const error = new Error(`API error: ${response.statusText}`);
            (error as any).status = response.status;
            throw error;
        }
        return response.json();
    },
};

// I Ching specific methods
export const interpretHexagram = async (hexagramData: any, lines: number[], userContext?: string, resultantHexagramData?: any) => {
    return api.post('/api/iching/interpret', { hexagramData, lines, userContext, resultantHexagramData });
};

// Oracle history
export const getHistory = async () => {
    return api.get('/api/history');
};

export const chatWithMaster = async (history: any[]) => {
    return api.post('/api/iching/chat', { history });
};

// Tarot specific methods
export const drawTarotCards = async () => {
    return api.get('/api/tarot/draw');
};

export const interpretTarot = async (past_card: any, present_card: any, future_card: any, userContext?: string) => {
    return api.post('/api/tarot/interpret', { past_card, present_card, future_card, userContext });
};

export const chatWithTarotReader = async (history: any[]) => {
    return api.post('/api/tarot/chat', { history });
};

// Runes specific methods
export const drawRunes = async () => {
    return api.get('/api/runes/draw');
};

export const interpretRunes = async (past_rune: any, present_rune: any, future_rune: any, userContext?: string) => {
    return api.post('/api/runes/interpret', { past_rune, present_rune, future_rune, userContext });
};

export const chatWithRunemaster = async (history: any[]) => {
    return api.post('/api/runes/chat', { history });
};

// Profile methods
export const getMyProfile = async () => {
    return api.get('/api/me');
};

export const getProfile = async () => {
    return api.get('/api/profile');
};

export const updateProfile = async (data: {
    display_name?: string;
    avatar_url?: string;
    birth_date?: string;
    birth_place?: string;
    current_place?: string;
    gender?: string;
    prompt_context?: string;
}) => {
    return api.put('/api/profile', data);
};

// Save chat history
export const saveChatHistory = async (sessionId: string | null, messages: { role: string; text: string }[]) => {
    return api.post('/api/chat/save', { session_id: sessionId, messages });
};

// Delete reading
export const deleteReading = async (sessionId: string) => {
    return api.delete(`/api/sessions/${sessionId}`);
};

// Toggle favorite
export const toggleFavorite = async (sessionId: string) => {
    return api.post(`/api/sessions/${sessionId}/favorite`, {});
};

// Token packages
export const getTokenPackages = async () => {
    return api.get('/api/tokens/packages');
};

export const purchaseTokens = async (packageId: string) => {
    return api.post('/api/tokens/purchase', { package_id: packageId });
};

export const addFreeTokens = async () => {
    return api.post('/api/tokens/add-free', {});
};
