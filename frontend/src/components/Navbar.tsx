import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { Search, Sun, Moon, Globe, User } from 'lucide-react';

export const Navbar: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('ui-lang', lng);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            alert(`Выполняется поиск по запросу: ${searchQuery}`);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg border-bottom shadow-sm bg-body-tertiary">
            <div className="container-fluid px-4">
                <a className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2" href="/">
                    <User size={22} />
                    <span>{t('brand_name')}</span>
                </a>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">

                    <form onSubmit={handleSearchSubmit} className="d-flex mx-auto my-2 my-lg-0 w-50 position-relative">
                        <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0">
                <Search size={18} className="text-muted" />
              </span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder={t('search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </form>

                    <div className="d-flex align-items-center gap-3">

                        <div className="dropdown">
                            <button
                                className="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-1"
                                type="button"
                                data-bs-toggle="dropdown"
                            >
                                <Globe size={16} />
                                <span>{i18n.language === 'ru' ? 'RU' : 'EN'}</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                                <li>
                                    <button className={`dropdown-item ${i18n.language === 'ru' ? 'active' : ''}`} onClick={() => changeLanguage('ru')}>
                                        {t('lang_ru')}
                                    </button>
                                </li>
                                <li>
                                    <button className={`dropdown-item ${i18n.language === 'en' ? 'active' : ''}`} onClick={() => changeLanguage('en')}>
                                        {t('lang_en')}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                            onClick={toggleTheme}
                            title={theme === 'light' ? t('theme_dark') : t('theme_light')}
                        >
                            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                            <span className="d-none d-md-inline">
                {theme === 'light' ? t('theme_dark') : t('theme_light')}
              </span>
                        </button>

                        <div className="dropdown">
                            <button className="btn btn-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" data-bs-toggle="dropdown" style={{ width: '36px', height: '36px' }}>
                                <User size={18} />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                                <li><a className="dropdown-item" href="/profile">{t('nav_profile')}</a></li>
                                <li><a className="dropdown-item" href="/positions">{t('nav_positions')}</a></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item text-danger">{t('nav_logout')}</button></li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </nav>
    );
};