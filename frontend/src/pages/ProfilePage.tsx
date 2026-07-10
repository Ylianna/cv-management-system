import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutoSave } from '../hooks/useAutoSave';
import { Save, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const BACKEND_URL = 'https://cv-backend-43xl.onrender.com';

interface ProfileData {
    id: string;
    firstName: string;
    lastName: string;
    location: string;
    photoUrl: string;
}

export const ProfilePage: React.FC = () => {
    useTranslation();

    const profileId = "test-profile-uuid-12345";

    const [profile, setProfile] = useState<ProfileData>({
        id: profileId,
        firstName: '',
        lastName: '',
        location: '',
        photoUrl: ''
    });

    const [version, setVersion] = useState<number>(1);
    const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'conflict' | 'error'>('saved');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/profile/${profileId}`)
            .then(res => {
                if (res.status === 404) {
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    setProfile(data.profile);
                    setVersion(data.version);
                }
            })
            .catch(() => setSyncStatus('error'));
    }, [profileId]);

    const handleBackendSave = async (updatedData: ProfileData, currentVersion: number): Promise<number | null> => {
        setSyncStatus('saving');

        try {
            const response = await fetch(`${BACKEND_URL}/api/profile/autosave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileId: updatedData.id,
                    firstName: updatedData.firstName,
                    lastName: updatedData.lastName,
                    location: updatedData.location,
                    photoUrl: updatedData.photoUrl,
                    version: currentVersion
                })
            });

            const result = await response.json();

            if (response.status === 200) {
                setSyncStatus('saved');
                return result.newVersion;
            }

            if (response.status === 409) {
                setSyncStatus('conflict');
                setErrorMessage(result.message || 'Конфликт версий на сервере.');
                return null;
            }

            setSyncStatus('error');
            return null;
        } catch (error) {
            setSyncStatus('error');
            return null;
        }
    };

    const { currentVersion } = useAutoSave({
        data: profile,
        version: version,
        onSave: handleBackendSave,
        delay: 5000
    });

    useEffect(() => {
        setVersion(currentVersion);
    }, [currentVersion]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const forceReload = () => {
        window.location.reload();
    };

    return (
        <div className="container py-4" style={{ maxWidth: '700px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded border shadow-sm bg-light-subtle">
                <div>
                    <h4 className="fw-bold m-0 d-flex align-items-center gap-2">
                        <Save size={20} className="text-primary" />
                        Раздел «Me» (Личный профиль)
                    </h4>
                    <small className="text-muted">Версия данных в памяти: {version}</small>
                </div>

                <div>
                    {syncStatus === 'saving' && (
                        <span className="badge bg-warning text-dark d-flex align-items-center gap-1 p-2">
              <RefreshCw size={14} className="spinner-border spinner-border-sm border-0" /> Сохранение...
            </span>
                    )}
                    {syncStatus === 'saved' && (
                        <span className="badge bg-success d-flex align-items-center gap-1 p-2">
              <CheckCircle size={14} /> Все изменения сохранены
            </span>
                    )}
                    {syncStatus === 'conflict' && (
                        <span className="badge bg-danger d-flex align-items-center gap-1 p-2">
              <AlertTriangle size={14} /> Ошибка блокировки
            </span>
                    )}
                </div>
            </div>

            {syncStatus === 'conflict' && (
                <div className="alert alert-danger shadow-sm d-flex flex-column gap-2" role="alert">
                    <div className="d-flex align-items-center gap-2fw-bold">
                        <AlertTriangle size={20} />
                        <span>Внимание! Изменения не могут быть перезаписаны.</span>
                    </div>
                    <p className="m-0 small">{errorMessage}</p>
                    <button className="btn btn-sm btn-outline-danger align-self-start mt-1" onClick={forceReload}>
                        Обновить и загрузить актуальные данные
                    </button>
                </div>
            )}

            <div className="card shadow-sm">
                <div className="card-body p-4">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Имя</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="firstName"
                                    value={profile.firstName}
                                    onChange={handleChange}
                                    disabled={syncStatus === 'conflict'}
                                    placeholder="Введите имя"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Фамилия</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="lastName"
                                    value={profile.lastName}
                                    onChange={handleChange}
                                    disabled={syncStatus === 'conflict'}
                                    placeholder="Введите фамилию"
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold">Местоположение</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="location"
                                    value={profile.location}
                                    onChange={handleChange}
                                    disabled={syncStatus === 'conflict'}
                                    placeholder="Например: Минск, Беларусь"
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold">Ссылка на личное фото</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="photoUrl"
                                    value={profile.photoUrl}
                                    onChange={handleChange}
                                    disabled={syncStatus === 'conflict'}
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};