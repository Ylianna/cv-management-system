import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "brand_name": "CV Template Engine",
            "search_placeholder": "Global search across CVs and positions...",
            "theme_light": "Light Mode",
            "theme_dark": "Dark Mode",
            "lang_ru": "Russian",
            "lang_en": "English",
            "nav_profile": "My Profile",
            "nav_positions": "Positions",
            "nav_logout": "Sign Out"
        }
    },
    ru: {
        translation: {
            "brand_name": "Система управления резюме",
            "search_placeholder": "Глобальный поиск по CV и позициям...",
            "theme_light": "Светлая тема",
            "theme_dark": "Тёмная тема",
            "lang_ru": "Русский",
            "lang_en": "English",
            "nav_profile": "Мой профиль",
            "nav_positions": "Вакансии",
            "nav_logout": "Выйти"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('ui-lang') || 'ru',
        fallbackLng: 'en',
        interpolation: { escapeValue: false }
    });

export default i18n;