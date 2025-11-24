import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setLanguage as setLocaleLang } from '../data/locales';
import type { Provider } from '../types';

interface SettingsState {
    apiKey: string;
    provider: Provider;
    setApiKey: (key: string) => void;
    setProvider: (provider: Provider) => void;
}

// Detect browser language
function detectLanguage(): string {
    const browserLang = navigator.language.toLowerCase();

    // Map browser language codes to supported languages
    if (browserLang.startsWith('ko')) return 'ko';
    if (browserLang.startsWith('tr')) return 'tr';
    return 'en'; // default
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            apiKey: '',
            provider: 'airlabs',
            setApiKey: (key) => set({ apiKey: key }),
            setProvider: (provider) => set({ provider }),
        }),
        {
            name: 'flight-settings',
            partialize: (state) => ({
                apiKey: state.apiKey,
                provider: state.provider,
            }),
        }
    )
);

// Initialize language from browser on store creation
const detectedLang = detectLanguage();
setLocaleLang(detectedLang);
document.documentElement.lang = detectedLang;
