import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './components/Navbar';
import { ProfilePage } from './pages/ProfilePage';
import { RecruiterPanel } from './pages/RecruiterPanel';
import { PositionsPage } from './pages/PositionsPage';
import { MainPage } from './pages/MainPage';
import { User, Settings, Layers, Briefcase, ShieldAlert } from 'lucide-react';

function App() {
    const { t } = useTranslation();

    const [currentRole, setCurrentRole] = useState<'CANDIDATE' | 'RECRUITER' | 'ADMIN'>('CANDIDATE');
    const [activeTab, setActiveTab] = useState<'main' | 'cv_list' | 'profile' | 'recruiter'>('main');

    useEffect(() => {
        const originalFetch = window.fetch;
        window.fetch = function (url, options: any = {}) {
            options.headers = {
                ...options.headers,
                'x-user-role': currentRole,
                'x-user-id': 'test-profile-uuid-12345'
            };
            return originalFetch(url, options);
        };

        if (currentRole === 'CANDIDATE' && activeTab === 'recruiter') {
            setActiveTab('main');
        }
    }, [currentRole, activeTab]);
    return (
        <div className="min-vh-100 d-flex flex-column bg-body text-body">
            <Navbar />
            <div className="container mt-3">
                <div className="alert alert-info py-2 px-3 d-flex align-items-center justify-content-between rounded-3 border-info-subtle shadow-sm mb-3">
            <span className="small fw-bold d-flex align-items-center gap-2 text-info-emphasis">
              <ShieldAlert size={16} /> Пульт симуляции ролей:
            </span>
                    <div className="btn-group btn-group-sm">
                        <button className={`btn btn-xs ${currentRole === 'CANDIDATE' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setCurrentRole('CANDIDATE')}>👨‍💻 Кандидат</button>
                        <button className={`btn btn-xs ${currentRole === 'RECRUITER' ? 'btn-warning text-dark' : 'btn-outline-warning'}`} onClick={() => setCurrentRole('RECRUITER')}>💼 Рекрутер</button>
                        <button className={`btn btn-xs ${currentRole === 'ADMIN' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setCurrentRole('ADMIN')}>👑 Администратор</button>
                    </div>
                </div>
            </div>

            <div className="container">
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <button className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'main' ? 'active' : ''}`} onClick={() => setActiveTab('main')}>
                            <Layers size={16} /> {t('tab_main')}
                        </button>
                    </li>

                    <li className="nav-item">
                        <button className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'cv_list' ? 'active' : ''}`} onClick={() => setActiveTab('cv_list')}>
                            <Briefcase size={16} /> {t('tab_cv_list')}
                        </button>
                    </li>

                    {(currentRole === 'CANDIDATE' || currentRole === 'ADMIN') && (
                        <li className="nav-item">
                            <button className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                                <User size={16} /> {t('tab_profile')}
                            </button>
                        </li>
                    )}

                    {(currentRole === 'RECRUITER' || currentRole === 'ADMIN') && (
                        <li className="nav-item">
                            <button className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'recruiter' ? 'active' : ''}`} onClick={() => setActiveTab('recruiter')}>
                                <Settings size={16} /> {t('tab_recruiter')}
                            </button>
                        </li>
                    )}
                </ul>
            </div>

            <main className="container flex-grow-1 py-4">
                {activeTab === 'main' && <MainPage />}
                {activeTab === 'cv_list' && <PositionsPage />}
                {activeTab === 'profile' && <ProfilePage />}
                {activeTab === 'recruiter' && <RecruiterPanel />}
            </main>
        </div>
    );
}

export default App;