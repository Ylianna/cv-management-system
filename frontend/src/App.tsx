import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './components/Navbar';
import { SafeTable } from './components/SafeTable';
import { ProfilePage } from './pages/ProfilePage';
import { RecruiterPanel } from './pages/RecruiterPanel';
import { User, FileText, Settings } from 'lucide-react';

const mockData = [
    { id: '1', name: 'Smith, John', position: 'Data Scientist', level: 'Middle' },
    { id: '2', name: 'King, Paul', position: 'DevOps Engineer', level: 'Junior' },
    { id: '3', name: 'Morris, Lee', position: 'QA Engineer', level: 'Senior' },
];

function App() {
    useTranslation();
    const [activeTab, setActiveTab] = useState<'cv_list' | 'profile' | 'recruiter'>('cv_list');

    return (
        <div className="min-vh-100 d-flex flex-column bg-body text-body">
            <Navbar />

            <div className="container mt-3">
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <button className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'cv_list' ? 'active' : ''}`} onClick={() => setActiveTab('cv_list')}>
                            <FileText size={16} /> Список резюме
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                            <User size={16} /> Мой профиль
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'recruiter' ? 'active' : ''}`} onClick={() => setActiveTab('recruiter')}>
                            <Settings size={16} /> Панель рекрутера (Поля)
                        </button>
                    </li>
                </ul>
            </div>

            <main className="container flex-grow-1 py-4">
                {activeTab === 'cv_list' && (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="fw-bold m-0">Список резюме</h2>
                        </div>
                        <SafeTable
                            data={mockData}
                            onView={(id) => alert(id)}
                            onEdit={(id) => alert(id)}
                            onDelete={(ids) => alert(ids)}
                        />                    </>
                )}

                {activeTab === 'profile' && <ProfilePage />}

                {activeTab === 'recruiter' && <RecruiterPanel />}
            </main>
        </div>
    );
}

export default App;