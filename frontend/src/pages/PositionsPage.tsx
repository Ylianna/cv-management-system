import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {SafeTable} from '../components/SafeTable';
import {Plus, Sliders, Briefcase} from 'lucide-react';
import {CVGeneratorPage} from "./CVGeneratorPage.tsx";
import {BACKEND_URL} from '../constants/api';
import {ErrorNotice} from "../components/ErrorNotice";
import toast from 'react-hot-toast';

interface AttributeRelation {
    id: string;
    name: string;
    type: string;
    PositionAttribute?: { isRequired: boolean };
}

interface PositionItem {
    id: string;
    title: string;
    description: string;
    maxProjects: number;
    version: number;
    requiredAttributes?: AttributeRelation[];
}

export const PositionsPage: React.FC = () => {
    const {t} = useTranslation();

    const [positions, setPositions] = useState<PositionItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [maxProjects, setMaxProjects] = useState(3);
    const [selectedAttrs, setSelectedAttrs] = useState<{ id: string; isRequired: boolean }[]>([]);
    const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
    const [activeError, setActiveError] = useState<string | null>(null);

    const [globalAttributes, setGlobalAttributes] = useState<any[]>([]);

    const tableData = positions.map(p => ({
        id: p.id,
        name: p.title,
        position: p.description.substring(0, 60) + (p.description.length > 60 ? '...' : ''),
        level: `Версия: ${p.version} (Проектов: ${p.maxProjects})`
    }));
    const loadInitialData = async () => {
        setLoading(true);
        try {
            const resPos = await fetch(`${BACKEND_URL}/api/positions`);
            const dataPos = await resPos.json();
            if (Array.isArray(dataPos)) setPositions(dataPos);

            const resAttr = await fetch(`${BACKEND_URL}/api/attributes`);
            const dataAttr = await resAttr.json();
            if (Array.isArray(dataAttr)) setGlobalAttributes(dataAttr);

            setLoading(false);
        } catch {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const handleCreatePosition = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            toast.error(t('toast_job_title_desc'));
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/positions`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    maxProjects,
                    attributes: selectedAttrs,
                    accessRules: []
                })
            });

            if (response.status === 201) {
                setTitle('');
                setDescription('');
                setSelectedAttrs([]);
                loadInitialData();
            }
        } catch {
            setActiveError('err_vacancy_save_failed');
        }
    };

    const handleDuplicatePosition = async (id: string) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/positions/${id}/duplicate`, {
                method: 'POST'
            });
            if (response.status === 201) {
                loadInitialData();
            }
        } catch {
            setActiveError('err_duplicate');
        }
    };

    const handleDeletePositions = async (ids: string[]) => {
        if (!window.confirm(t('warn_delete_template'))) return;
        try {
            for (const id of ids) {
                await fetch(`${BACKEND_URL}/api/positions/${id}`, {method: 'DELETE'});
            }
            loadInitialData();
        } catch {
            setActiveError('err_delete_failed');
        }
    };

    const toggleAttributeSelection = (attrId: string) => {
        const isAlreadySelected = selectedAttrs.some(a => a.id === attrId);
        if (isAlreadySelected) {
            setSelectedAttrs(selectedAttrs.filter(a => a.id !== attrId));
        } else {
            setSelectedAttrs([...selectedAttrs, {id: attrId, isRequired: false}]);
        }
    };

    const toggleRequiredStatus = (attrId: string) => {
        setSelectedAttrs(selectedAttrs.map(a => a.id === attrId ? {...a, isRequired: !a.isRequired} : a));
    };

    if (selectedPositionId) {
        return <CVGeneratorPage positionId={selectedPositionId} onBack={() => setSelectedPositionId(null)}/>;
    }

    return (
        <div className="container py-4">

            {activeError && (
                <ErrorNotice
                    messageKey={activeError}
                    isCritical={activeError === 'err_network_fail' || activeError === 'err_delete_failed' || activeError === 'err_duplicate' || activeError === 'err_vacancy_save_failed'}
                    onClose={() => setActiveError(null)}
                />
            )}

            <div className="row g-4">

                <div className="col-lg-5">
                    <div className="card shadow-sm border-success-subtle">
                        <div className="card-header bg-success text-white fw-bold d-flex align-items-center gap-2">
                            <Sliders size={18}/>
                            <span>{t('constructor_title')}</span>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleCreatePosition}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">{t('field_pos_title')}</label>
                                    <input type="text" className="form-control form-control-sm"
                                           placeholder={t('placeholder_pos_title')} value={title}
                                           onChange={e => setTitle(e.target.value)}/>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">{t('field_pos_desc')}</label>
                                    <textarea className="form-control form-control-sm" rows={2}
                                              placeholder={t('placeholder_pos_desc')} value={description}
                                              onChange={e => setDescription(e.target.value)}/>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">{t('field_max_projects')}</label>
                                    <input type="number" className="form-control form-control-sm" min={1} max={10}
                                           value={maxProjects} onChange={e => setMaxProjects(Number(e.target.value))}/>
                                </div>

                                <div className="mb-3">
                                    <label
                                        className="form-label fw-semibold d-block mb-2">{t('field_bind_attrs')}</label>
                                    <div className="border rounded p-2 bg-light flex-column gap-1 d-flex"
                                         style={{maxHeight: '180px', overflowY: 'auto'}}>
                                        {globalAttributes.map(attr => {
                                            const selection = selectedAttrs.find(a => a.id === attr.id);
                                            const isChecked = !!selection;
                                            return (
                                                <div key={attr.id}
                                                     className="d-flex align-items-center justify-content-between p-1 border-bottom bg-white rounded mb-1">
                                                    <div className="form-check m-0">
                                                        <input type="checkbox" className="form-check-input small"
                                                               id={`check-${attr.id}`} checked={isChecked}
                                                               onChange={() => toggleAttributeSelection(attr.id)}/>
                                                        <label className="form-check-label small fw-medium"
                                                               htmlFor={`check-${attr.id}`}>{attr.name}</label>
                                                    </div>
                                                    {isChecked && (
                                                        <button type="button"
                                                                className={`btn btn-xs py-0 px-1 border small ${selection.isRequired ? 'btn-danger text-white' : 'btn-outline-secondary'}`}
                                                                onClick={() => toggleRequiredStatus(attr.id)}>
                                                            {selection.isRequired ? t('status_required') : t('status_optional')}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button type="submit"
                                        className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-1 mt-4">
                                    <Plus size={16}/> {t('btn_create_template')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card shadow-sm">
                        <div className="card-header bg-dark text-white fw-bold d-flex align-items-center gap-2">
                            <Briefcase size={18}/>
                            <span>{t('available_positions')}</span>
                        </div>
                        <div className="card-body p-3">
                            {loading ? (
                                <div className="p-5 text-center text-muted">{t('loading_positions')}</div>
                            ) : positions.length === 0 ? (
                                <div className="p-5 text-center text-muted">{t('empty_positions')}</div>
                            ) : (
                                <SafeTable
                                    data={tableData}
                                    onView={(id) => setSelectedPositionId(id)}
                                    onEdit={(id) => handleDuplicatePosition(id[0])}
                                    onDelete={handleDeletePositions}
                                />
                            )}
                            <small className="text-muted mt-2 d-block text-center">{t('table_info_tip')}</small>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};