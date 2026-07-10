import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutoSave } from '../hooks/useAutoSave';
import ReactMarkdown from 'react-markdown';
import { Save, AlertTriangle, CheckCircle, RefreshCw, Plus, Trash2, Calendar, Eye } from 'lucide-react';

const BACKEND_URL = 'https://cv-backend-43xl.onrender.com';

interface ProfileData {
    id: string;
    firstName: string;
    lastName: string;
    location: string;
    photoUrl: string;
}

interface ProjectData {
    id?: string;
    name: string;
    startDate: string;
    endDate: string;
    description: string;
    tags: string[];
}

export const ProfilePage: React.FC = () => {
    useTranslation();
    const profileId = "test-profile-uuid-12345";

    const [profile, setProfile] = useState<ProfileData>({
        id: profileId, firstName: '', lastName: '', location: '', photoUrl: ''
    });
    const [version, setVersion] = useState<number>(1);
    const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'conflict' | 'error'>('saved');

    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [newProject, setNewProject] = useState<ProjectData>({
        name: '', startDate: '', endDate: '', description: '', tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [previewMarkdown, setPreviewMarkdown] = useState(false);

    const allExistingTags = Array.from(new Set(projects.flatMap(p => p.tags || [])));

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/profile/${profileId}`)
            .then(res => res.status === 200 ? res.json() : null)
            .then(data => {
                if (data) { setProfile(data.profile); setVersion(data.version); }
            });

        fetch(`${BACKEND_URL}/api/profile/${profileId}/projects`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setProjects(data); });
    }, [profileId]);

    const handleBackendSave = async (updatedData: ProfileData, currentVersion: number): Promise<number | null> => {
        setSyncStatus('saving');
        try {
            const response = await fetch(`${BACKEND_URL}/api/profile/autosave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updatedData, version: currentVersion })
            });
            const result = await response.json();
            if (response.status === 200) { setSyncStatus('saved'); return result.newVersion; }
            if (response.status === 409) { setSyncStatus('conflict'); return null; }
            setSyncStatus('error'); return null;
        } catch { setSyncStatus('error'); return null; }
    };

    const { currentVersion } = useAutoSave({ data: profile, version, onSave: handleBackendSave, delay: 5000 });
    useEffect(() => { setVersion(currentVersion); }, [currentVersion]);

    const handleAddTag = (tag: string) => {
        const cleanTag = tag.trim();
        if (cleanTag && !newProject.tags.includes(cleanTag)) {
            setNewProject(prev => ({ ...prev, tags: [...prev.tags, cleanTag] }));
            setTagInput('');
        }
    };

    const handleSaveProject = async () => {
        if (!newProject.name || !newProject.startDate || !newProject.endDate) {
            alert('Заполните название и даты проекта!');
            return;
        }
        try {
            const res = await fetch(`${BACKEND_URL}/api/profile/${profileId}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject)
            });
            const data = await res.json();
            setProjects(prev => [...prev.filter(p => p.id !== data.project.id), data.project]);
            setNewProject({ name: '', startDate: '', endDate: '', description: '', tags: [] });
        } catch {
            alert('Ошибка сохранения проекта');
        }
    };

    const handleDeleteProject = async (id: string) => {
        try {
            await fetch(`${BACKEND_URL}/api/projects/${id}`, { method: 'DELETE' });
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch {
            alert('Ошибка при удалении');
        }
    };

    return (
        <div className="container py-4" style={{ maxWidth: '800px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded border shadow-sm bg-light-subtle">
                <h4 className="fw-bold m-0 d-flex align-items-center gap-2"><Save size={20} className="text-primary"/>Раздел «Me»</h4>
                <div>
                    {syncStatus === 'saving' && <span className="badge bg-warning text-dark p-2"><RefreshCw size={14} className="spinner-border spinner-border-sm border-0" /> Сохранение...</span>}
                    {syncStatus === 'saved' && <span className="badge bg-success p-2"><CheckCircle size={14} /> Изменения сохранены</span>}
                    {syncStatus === 'conflict' && <span className="badge bg-danger p-2"><AlertTriangle size={14} /> Ошибка блокировки</span>}
                </div>
            </div>

            <div className="card shadow-sm mb-5">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Имя</label>
                            <input type="text" className="form-control" name="firstName" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} disabled={syncStatus === 'conflict'} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Фамилия</label>
                            <input type="text" className="form-control" name="lastName" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} disabled={syncStatus === 'conflict'} />
                        </div>
                        <div className="col-12">
                            <label className="form-label fw-semibold">Местоположение</label>
                            <input type="text" className="form-control" name="location" value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} disabled={syncStatus === 'conflict'} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-top pt-4">
                <h4 className="fw-bold mb-4 d-flex align-items-center gap-2"><Calendar size={22} className="text-success" /> Раздел «Projects»</h4>

                <div className="card shadow-sm border-success-subtle mb-4">
                    <div className="card-header bg-success-subtle text-success-emphasis fw-bold">Добавить новый проект</div>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label fw-semibold">Название проекта</label>
                                <input type="text" className="form-control" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} placeholder="Например: E-commerce Platform" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Дата начала</label>
                                <input type="date" className="form-control" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Дата окончания</label>
                                <input type="date" className="form-control" value={newProject.endDate} onChange={e => setNewProject({...newProject, endDate: e.target.value})} />
                            </div>

                            <div className="col-12 position-relative">
                                <label className="form-label fw-semibold">Технологические теги</label>
                                <div className="d-flex flex-wrap gap-1 mb-2">
                                    {newProject.tags.map(t => (
                                        <span key={t} className="badge bg-secondary p-2 d-flex align-items-center gap-1">
                      {t} <Trash2 size={12} style={{cursor: 'pointer'}} onClick={() => setNewProject({...newProject, tags: newProject.tags.filter(tag => tag !== t)})} />
                    </span>
                                    ))}
                                </div>
                                <div className="input-group">
                                    <input type="text" className="form-control form-control-sm" placeholder="Введите тег и нажмите Добавить" value={tagInput} onChange={e => setTagInput(e.target.value)} />
                                    <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => handleAddTag(tagInput)}>Добавить</button>
                                </div>
                                {tagInput && allExistingTags.filter(t => t.toLowerCase().startsWith(tagInput.toLowerCase())).length > 0 && (
                                    <div className="list-group shadow-sm mt-1 position-absolute z-3 w-100">
                                        {allExistingTags.filter(t => t.toLowerCase().startsWith(tagInput.toLowerCase())).map(t => (
                                            <button key={t} type="button" className="list-group-item list-group-item-action py-1 small" onClick={() => handleAddTag(t)}>{t}</button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="col-12">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <label className="form-label fw-semibold m-0">Описание проекта (Поддержка Markdown)</label>
                                    <button type="button" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={() => setPreviewMarkdown(!previewMarkdown)}>
                                        <Eye size={14} /> {previewMarkdown ? 'Редактировать' : 'Предпросмотр Markdown'}
                                    </button>
                                </div>
                                {previewMarkdown ? (
                                    <div className="p-3 border rounded bg-light text-dark" style={{ minHeight: '120px' }}>
                                        <ReactMarkdown>{newProject.description || '*Описание пусто*'}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <textarea className="form-control" rows={4} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="Используйте # для заголовков, **жирный**, *курсив* или списки..." />
                                )}
                            </div>

                            <div className="col-12 text-end">
                                <button type="button" className="btn btn-success d-inline-flex align-items-center gap-1" onClick={handleSaveProject}><Plus size={16} /> Сохранить проект</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    {projects.map(p => (
                        <div key={p.id} className="card shadow-sm mb-3 border-light-subtle bg-body-tertiary">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5 className="fw-bold m-0">{p.name}</h5>
                                        <small className="text-muted">{p.startDate ? new Date(p.startDate).toLocaleDateString() : ''} — {p.endDate ? new Date(p.endDate).toLocaleDateString() : ''}</small>
                                    </div>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => p.id && handleDeleteProject(p.id)}><Trash2 size={14} /></button>
                                </div>
                                <div className="mt-2 text-secondary markdown-body">
                                    <ReactMarkdown>{p.description}</ReactMarkdown>
                                </div>
                                <div className="d-flex flex-wrap gap-1 mt-2">
                                    {p.tags?.map(t => <span key={t} className="badge bg-light text-dark border">{t}</span>)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};