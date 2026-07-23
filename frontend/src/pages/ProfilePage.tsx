import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutoSave } from '../hooks/useAutoSave';
import ReactMarkdown from 'react-markdown';
import { Save, AlertTriangle, CheckCircle, RefreshCw, Plus, Trash2, Calendar, Eye, Info, Search, Filter, Clock } from 'lucide-react';
import { CATEGORIES } from '../constants/attributes';
import { BACKEND_URL } from '../constants/api';

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

interface AttributeLibraryItem {
    id: string;
    category: string;
    name: string;
    description: string;
    type: 'STRING' | 'TEXT' | 'NUMERIC' | 'BOOLEAN' | 'DROPDOWN';
    options: string[] | null;
}

interface UserAttributeValue {
    id?: string;
    attributeId: string;
    value: string;
    attribute: AttributeLibraryItem;
}

export const ProfilePage: React.FC = () => {
    const { t } = useTranslation();
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

    const [userValues, setUserValues] = useState<UserAttributeValue[]>([]);
    const [library, setLibrary] = useState<AttributeLibraryItem[]>([]);
    const [recentlyUsed, setRecentlyUsed] = useState<AttributeLibraryItem[]>([]);

    const [searchPrefix, setSearchPrefix] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const allExistingTags = Array.from(new Set(projects.flatMap(p => p.tags || [])));

    const loadAllData = () => {
        fetch(`${BACKEND_URL}/api/profile/${profileId}`)
            .then(res => res.status === 200 ? res.json() : null)
            .then(data => { if (data) { setProfile(data.profile); setVersion(data.version); } });

        fetch(`${BACKEND_URL}/api/profile/${profileId}/projects`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setProjects(data); });

        fetch(`${BACKEND_URL}/api/profile/${profileId}/attributes`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setUserValues(data); });
    };

    useEffect(() => {
        const queryParams = new URLSearchParams();
        if (searchPrefix) queryParams.append('prefix', searchPrefix);
        if (selectedCategory) queryParams.append('category', selectedCategory);

        fetch(`${BACKEND_URL}/api/attributes?${queryParams.toString()}`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setLibrary(data); });
    }, [searchPrefix, selectedCategory]);

    useEffect(() => {
        loadAllData();
        const savedRecent = localStorage.getItem('recent-attrs');
        if (savedRecent) setRecentlyUsed(JSON.parse(savedRecent));
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

    const handleAddAttributeToProfile = (attr: AttributeLibraryItem) => {
        const alreadyExists = userValues.some(v => v.attributeId === attr.id);
        if (alreadyExists) return;

        const newValue: UserAttributeValue = {
            attributeId: attr.id,
            value: attr.type === 'BOOLEAN' ? 'false' : '',
            attribute: attr
        };
        setUserValues(prev => [...prev, newValue]);

        const updatedRecent = [attr, ...recentlyUsed.filter(r => r.id !== attr.id)].slice(0, 3);
        setRecentlyUsed(updatedRecent);
        localStorage.setItem('recent-attrs', JSON.stringify(updatedRecent));
    };

    const handleSaveAttributeValue = async (attrId: string, val: string) => {
        try {
            await fetch(`${BACKEND_URL}/api/profile/${profileId}/attributes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attributeId: attrId, value: val })
            });
            setUserValues(prev => prev.map(v => v.attributeId === attrId ? { ...v, value: val } : v));
        } catch {
            alert('Ошибка сохранения атрибута');
        }
    };

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
        } catch { alert('Ошибка сохранения проекта'); }
    };

    const handleDeleteProject = async (id: string) => {
        try {
            await fetch(`${BACKEND_URL}/api/projects/${id}`, { method: 'DELETE' });
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch { alert('Ошибка при удалении'); }
    };

    return (
        <div className="container py-4" style={{ maxWidth: '850px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded border shadow-sm bg-light-subtle">
                <h4 className="fw-bold m-0 d-flex align-items-center gap-2">
                    <Save size={20} className="text-primary"/>
                    {t('profile_title')}
                </h4>
                <div>
                    {syncStatus === 'saving' && <span className="badge bg-warning text-dark p-2"><RefreshCw size={14} className="spinner-border spinner-border-sm border-0" /> {t('status_saving')}</span>}
                    {syncStatus === 'saved' && <span className="badge bg-success p-2"><CheckCircle size={14} /> {t('status_saved')}</span>}
                    {syncStatus === 'conflict' && <span className="badge bg-danger p-2"><AlertTriangle size={14} /> {t('status_conflict')}</span>}
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">{t('field_firstname')}</label>
                            <input type="text" className="form-control" placeholder={t('placeholder_firstname')} value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} disabled={syncStatus === 'conflict'} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">{t('field_lastname')}</label>
                            <input type="text" className="form-control" placeholder={t('placeholder_lastname')} value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} disabled={syncStatus === 'conflict'} />
                        </div>
                        <div className="col-12">
                            <label className="form-label fw-semibold">{t('field_location')}</label>
                            <input type="text" className="form-control" placeholder={t('placeholder_location')} value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} disabled={syncStatus === 'conflict'} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-top pt-4 mb-5">
                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2"><Info size={22} className="text-primary" /> {t('section_info_title')} </h4>

                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text"><Search size={14} /></span>
                            <input type="text" className="form-control" placeholder={t('placeholder_search_prefix')} value={searchPrefix} onChange={e => setSearchPrefix(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text"><Filter size={14} /></span>
                            <select className="form-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                                <option value="">{t('filter_all_categories')}</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {recentlyUsed.length > 0 && (
                    <div className="mb-3 p-2 bg-light-subtle border rounded small">
                        <span className="text-muted fw-bold d-inline-flex align-items-center gap-1 me-2"><Clock size={12} /> {t('recent_fields')}</span>
                        {recentlyUsed.map(r => (
                            <button key={r.id} type="button" className="btn btn-xs btn-outline-secondary me-1 py-0 px-2" onClick={() => handleAddAttributeToProfile(r)}>+ {r.name}</button>
                        ))}
                    </div>
                )}

                <div className="mb-4 d-flex flex-wrap gap-1 p-2 border rounded bg-light" style={{maxHeight: '120px', overflowY: 'auto'}}>
                    {library.map(attr => (
                        <button key={attr.id} type="button" className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1" onClick={() => handleAddAttributeToProfile(attr)}>
                            <Plus size={12} /> <span className="fw-semibold text-dark">{attr.name}</span> <span className="text-muted small">({attr.type})</span>
                        </button>
                    ))}
                </div>

                <div className="space-y-3 mb-4">
                    {userValues.map(item => (
                        <div key={item.attributeId} className="card shadow-sm p-3 mb-2 border-start border-primary border-3">
                            <div className="row align-items-center">
                                <div className="col-md-4">
                                    <div className="fw-bold">{item.attribute.name}</div>
                                    <small className="text-muted d-block">{item.attribute.description}</small>
                                </div>
                                <div className="col-md-8">
                                    {item.attribute.type === 'BOOLEAN' ? (
                                        <div className="form-check">
                                            <input type="checkbox" className="form-check-input" checked={item.value === 'true'} onChange={e => handleSaveAttributeValue(item.attributeId, String(e.target.checked))} />
                                            <label className="form-check-label">{t('boolean_yes')}</label>
                                        </div>
                                    ) : item.attribute.type === 'DROPDOWN' ? (
                                        <select className="form-select form-select-sm" value={item.value} onChange={e => handleSaveAttributeValue(item.attributeId, e.target.value)}>
                                            <option value="">{t('select_value_placeholder')}</option>
                                            {item.attribute.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input type="text" className="form-control form-control-sm" placeholder={t('placeholder_input_value', { type: item.attribute.type })} value={item.value} onChange={e => setUserValues(prev => prev.map(v => v.attributeId === item.attributeId ? {...v, value: e.target.value} : v))} onBlur={e => handleSaveAttributeValue(item.attributeId, e.target.value)} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border-top pt-4">
                <h4 className="fw-bold mb-4 d-flex align-items-center gap-2"><Calendar size={22} className="text-success" /> {t('section_projects_title')}</h4>
                <div className="card shadow-sm border-success-subtle mb-4">
                    <div className="card-header bg-success-subtle text-success-emphasis fw-bold">{t('card_add_project_title')}</div>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label fw-semibold">{t('label_project_name')}</label>
                                <input type="text" className="form-control" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} placeholder={t('placeholder_project_name')} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">{t('label_start_date')}</label>
                                <input type="date" className="form-control" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">{t('label_end_date')}</label>
                                <input type="date" className="form-control" value={newProject.endDate} onChange={e => setNewProject({...newProject, endDate: e.target.value})} />
                            </div>
                            <div className="col-12 position-relative">
                                <label className="form-label fw-semibold">{t('label_tech_tags')}</label>
                                <div className="d-flex flex-wrap gap-1 mb-2">
                                    {newProject.tags.map(t => (
                                        <span key={t} className="badge bg-secondary p-2 d-flex align-items-center gap-1">
                      {t} <Trash2 size={12} style={{cursor: 'pointer'}} onClick={() => setNewProject({...newProject, tags: newProject.tags.filter(tag => tag !== t)})} />
                    </span>
                                    ))}
                                </div>
                                <div className="input-group">
                                    <input type="text" className="form-control form-control-sm" placeholder={t('placeholder_enter_tag')} value={tagInput} onChange={e => setTagInput(e.target.value)} />
                                    <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => handleAddTag(tagInput)}>{t('btn_add_tag')}</button>
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
                                    <label className="form-label fw-semibold m-0">{t('label_project_desc')}</label>
                                    <button type="button" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={() => setPreviewMarkdown(!previewMarkdown)}>
                                        <Eye size={14} /> {previewMarkdown ? t('btn_edit_md') : t('btn_preview_md')}
                                    </button>
                                </div>
                                {previewMarkdown ? (
                                    <div className="p-3 border rounded bg-light text-dark" style={{ minHeight: '120px' }}>
                                        <ReactMarkdown>{newProject.description || t('placeholder_empty_desc')}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <textarea className="form-control" rows={4} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                                )}
                            </div>
                            <div className="col-12 text-end">
                                <button type="button" className="btn btn-success d-inline-flex align-items-center gap-1" onClick={handleSaveProject}><Plus size={16} /> {t('btn_save_project')}</button>
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