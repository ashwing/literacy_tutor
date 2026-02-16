import Anthropic from '@anthropic-ai/sdk';

const API_KEY_STORAGE_KEY = 'anthropic_api_key';

export const getApiKey = (): string | null => {
    // Priority 1: Environment Variable (Vite requires VITE_ prefix for client-side access, 
    // but strictly speaking, storing keys in client-side env is risky for public apps.
    // For a local educational app, it's acceptable if the user sets it locally.)
    if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
        return import.meta.env.VITE_ANTHROPIC_API_KEY;
    }

    // Priority 2: Local Storage (User entered it in UI)
    return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const setApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const createAnthropicClient = (): Anthropic | null => {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    return new Anthropic({
        apiKey: apiKey,
        baseURL: window.location.origin + '/api/anthropic',
        dangerouslyAllowBrowser: true // Required for client-side only apps
    });
};
