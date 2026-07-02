import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "welcome": "CV Management System",
            "search_placeholder": "Search across CVs and positions...",
            "latest_positions": "Latest Positions"
        }
    },
    ru: {
        translation: {
            "welcome": "Система управления резюме",
            "search_placeholder": "Поиск по резюме и позициям...",
            "latest_positions": "Последние вакансии"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('ui-lang') || 'ru',
        interpolation: { escapeValue: false }
    });

export default i18n;