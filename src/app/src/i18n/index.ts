import store from 'app/store';
import ja from './locales/ja.json';

export const LANGUAGES = { en: 'English', ja: '日本語' } as const;
export type Language = keyof typeof LANGUAGES;

const tables: Record<string, Record<string, string>> = { ja };

let currentLang: Language = 'en';
let table: Record<string, string> = {};
const missing = new Set<string>();

export function setLanguage(lang: Language) {
    currentLang = lang;
    table = tables[lang] ?? {};
    document.documentElement.lang = lang;
}

export function initI18n() {
    setLanguage(store.get('workspace.language', 'en'));
    if (process.env.NODE_ENV !== 'production') {
        (window as any).__i18nMissing = missing;
    }
}

export function t(key: string, vars?: Record<string, string | number>): string {
    let s = table[key] || key;
    if (
        process.env.NODE_ENV !== 'production' &&
        s === key &&
        currentLang !== 'en'
    ) {
        missing.add(key);
    }
    if (vars) {
        s = s.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
    }
    return s;
}
