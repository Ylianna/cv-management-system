import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { DiscussionTab } from '../components/DiscussionTab';
import {useTranslation} from "react-i18next";
import { BACKEND_URL } from '../constants/api';
import {ErrorNotice} from "../components/ErrorNotice";

interface CVGeneratorPageProps {
    positionId: string;
    onBack: () => void;
}

export const CVGeneratorPage: React.FC<CVGeneratorPageProps> = ({ positionId, onBack }) => {
    const profileId = "test-profile-uuid-12345";
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [cv, setCv] = useState<any>(null);
    const [position, setPosition] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [activeView, setActiveView] = useState<'cv' | 'chat'>('cv');
    const [activeError, setActiveError] = useState<string | null>(null);

    const [cvValues, setCvValues] = useState<{ [key: string]: string }>({});
    const [projects, setProjects] = useState<any[]>([]);
    const loadCVData = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/positions/${positionId}/generate/${profileId}`);
            const data = await res.json();

            setCv(data.cv);
            setPosition(data.position);
            setProfile(data.profile);
            setProjects(data.projects);

            const initialValues: { [key: string]: string } = {};
            const requiredAttrs = data.position.requiredAttributes || [];
            const filledAttrs = data.filledAttributes || [];

            requiredAttrs.forEach((reqAttr: any) => {
                const match = filledAttrs.find((f: any) => f.attributeId === reqAttr.id);
                initialValues[reqAttr.id] = match ? match.value : '';
            });

            setCvValues(initialValues);
            setLoading(false);
        } catch {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCVData();
    }, [positionId]);

    const handleInlineEdit = async (attrId: string, value: string) => {
        setCvValues(prev => ({ ...prev, [attrId]: value }));
        try {
            await fetch(`${BACKEND_URL}/api/profile/${profileId}/attributes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attributeId: attrId, value })
            });
        } catch {
            setActiveError('err_value_save');
        }
    };

    const handlePublish = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/cv/${cv.id}/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version: cv.version })
            });
            if (res.status === 200) {
                loadCVData();
            } else {
                setActiveError('err_version_conflict');
            }
        } catch {
            setActiveError('err_publish');
        }
    };

    const isPublishable = position?.requiredAttributes?.every((attr: any) => {
        if (!attr.PositionAttribute?.isRequired) return true;
        return cvValues[attr.id] && cvValues[attr.id].trim() !== '';
    });
    if (loading) return <div className="p-5 text-center text-muted">Сборка резюме из данных профиля...</div>;

    return (
        <div className="container py-4" style={{ maxWidth: '850px' }}>

            {activeError && (
                <ErrorNotice
                    messageKey={activeError}
                    isCritical={activeError === 'err_network_fail' || activeError === 'err_value_save' || activeError === 'err_version_conflict' || activeError === 'err_publish'}
                    onClose={() => setActiveError(null)}
                />
            )}

            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={onBack}>
                        <ArrowLeft size={16} /> {t('btn_back')}
                    </button>
                    <div className="btn-group btn-group-sm">
                        <button className={`btn ${activeView === 'cv' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveView('cv')}>{t('tab_cv_view')}</button>
                        <button className={`btn ${activeView === 'chat' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveView('chat')}>{t('tab_discussion')}</button>
                    </div>
                </div>
                {activeView === 'cv' ? (
                        <div className="card shadow-lg border-0 p-5 bg-white text-dark rounded-3">
                    <div>
                        {cv?.isPublished ? (
                            <span className="badge bg-success p-2 d-flex align-items-center gap-1">{t('status_published')}</span>
                        ) : (
                            <button className="btn btn-sm btn-primary" disabled={!isPublishable} onClick={handlePublish}>{t('btn_publish_cv')}</button>
                        )}
                    </div>
                        </div>
                )
                    : (
                    <DiscussionTab positionId={positionId} />
                )}
            </div>

            <div className="card shadow-lg border-0 p-5 bg-white text-dark rounded-3">
                <div className="border-bottom pb-4 mb-4">
                    <h2 className="fw-bold text-uppercase m-0">{profile?.firstName} {profile?.lastName}</h2>
                    <p className="text-muted m-0 mt-1 fw-medium">📍 {profile?.location || t('location_not_specified')}</p>
                    <div className="badge bg-primary-subtle text-primary mt-2">{t('cv_for_position', { title: position?.title })}</div>
                </div>

                <div className="mb-4">
                    <h5 className="fw-bold text-secondary text-uppercase border-bottom pb-2 mb-3">{t('skills_title')}</h5>
                    <div className="row g-3">
                        {position?.requiredAttributes?.map((attr: any) => {
                            const value = cvValues[attr.id] || '';
                            const isRequired = attr.PositionAttribute?.isRequired;
                            const isEmpty = value.trim() === '';

                            return (
                                <div key={attr.id} className="col-12 p-2 rounded hover-bg-light transition-colors">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold small text-dark">
                      {attr.name} {isRequired && <span className="text-danger">*</span>}
                    </span>
                                        {isEmpty && <span className="text-danger small d-flex align-items-center gap-1"><AlertCircle size={12}/> {t('field_required_warning')}</span>}
                                    </div>

                                    {attr.type === 'DROPDOWN' ? (
                                        <select
                                            className={`form-select form-select-sm ${isEmpty && isRequired ? 'border-danger bg-danger-subtle' : ''}`}
                                            value={value}
                                            onChange={e => handleInlineEdit(attr.id, e.target.value)}
                                        >
                                            <option value="">{t('dropdown_default_option')}</option>
                                            {attr.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            className={`form-control form-control-sm ${isEmpty && isRequired ? 'border-danger bg-danger-subtle text-danger' : ''}`}
                                            placeholder={isEmpty ? t('placeholder_inline_empty') : ""}
                                            value={value}
                                            onChange={e => handleInlineEdit(attr.id, e.target.value)}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h5 className="fw-bold text-secondary text-uppercase border-bottom pb-2 mb-3">{t('experience_title', { max: position?.maxProjects || 3 })}</h5>
                    {projects.length === 0 ? (
                        <p className="text-muted small italic">{t('no_projects_in_profile')}</p>
                    ) : (
                        projects.map(p => (
                            <div key={p.id} className="mb-4">
                                <div className="d-flex justify-content-between align-items-baseline">
                                    <h6 className="fw-bold m-0 text-dark">{p.name}</h6>
                                    <small className="text-muted fw-medium">{new Date(p.startDate).toLocaleDateString()} — {new Date(p.endDate).toLocaleDateString()}</small>
                                </div>
                                <div className="small text-secondary mt-1">
                                    <ReactMarkdown>{p.description}</ReactMarkdown>
                                </div>
                                <div className="d-flex gap-1 mt-1">
                                    {p.tags?.map((t: string) => <span key={t} className="badge bg-light text-muted border small">{t}</span>)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};