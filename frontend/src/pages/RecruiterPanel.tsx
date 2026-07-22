import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Sliders, Layers } from 'lucide-react';

const BACKEND_URL = 'https://cv-backend-43xl.onrender.com';

const CATEGORIES = ['Certification', 'Domain Knowledge', 'Personal Information', 'Soft Skills'];

const ATTRIBUTE_TYPES = [
    { value: 'STRING', label: 'Строка (plain text)' },
    { value: 'TEXT', label: 'Текст (Markdown)' },
    { value: 'NUMERIC', label: 'Числовое поле' },
    { value: 'BOOLEAN', label: 'Логическое (чекбокс)' },
    { value: 'DROPDOWN', label: 'Выпадающий список (Dropdown)' }
];

interface AttributeItem {
    id: string;
    category: string;
    name: string;
    description: string;
    type: string;
    options: string[] | null;
}

export const RecruiterPanel: React.FC = () => {
    const { t } = useTranslation();

    const [attributes, setAttributes] = useState<AttributeItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [category, setCategory] = useState(CATEGORIES[0]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('STRING');
    const [optionsInput, setOptionsInput] = useState('');

    const loadAttributes = () => {
        setLoading(true);
        fetch(`${BACKEND_URL}/api/attributes`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setAttributes(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        loadAttributes();
    }, []);

    const handleCreateAttribute = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !description.trim()) {
            alert('Пожалуйста, заполните имя и описание атрибута!');
            return;
        }

        let parsedOptions: string[] | null = null;
        if (type === 'DROPDOWN') {
            parsedOptions = optionsInput
                .split(',')
                .map((opt) => opt.trim())
                .filter((opt) => opt.length > 0);

            if (parsedOptions.length === 0) {
                alert('Для выпадающего списка нужно указать хотя бы один вариант через запятую!');
                return;
            }
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/attributes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    name: name.trim(),
                    description: description.trim(),
                    type,
                    options: parsedOptions
                })
            });

            if (response.status === 201) {
                alert('Атрибут успешно добавлен в глобальную библиотеку!');
                setName('');
                setDescription('');
                setOptionsInput('');
                loadAttributes();
            } else {
                const errData = await response.json();
                alert(`Ошибка: ${errData.error || 'Не удалось создать атрибут'}`);
            }
        } catch {
            alert('Серверная ошибка при создании атрибута.');
        }
    };

    return (
        <div className="container py-4">
            <div className="row g-4">

                <div className="col-lg-5">
                    <div className="card shadow-sm border-primary-subtle">
                        <div className="card-header bg-primary text-white fw-bold d-flex align-items-center gap-2">
                            <Sliders size={18} />
                            <span>{t('attr_constructor_title')}</span>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleCreateAttribute}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">{t('field_attr_category')}</label>
                                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">{t('field_attr_name')}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t('placeholder_attr_name')}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">{t('field_attr_desc')}</label>
                                    <textarea
                                        className="form-control"
                                        rows={2}
                                        placeholder={t('placeholder_attr_desc')}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">{t('field_attr_type')}</label>
                                    <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                                        {ATTRIBUTE_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {type === 'DROPDOWN' && (
                                    <div className="mb-3 p-3 bg-light rounded border border-warning-subtle">
                                        <label className="form-label fw-semibold text-warning-emphasis">{t('field_dropdown_opts')}</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Junior, Middle, Senior, Lead"
                                            value={optionsInput}
                                            onChange={(e) => setOptionsInput(e.target.value)}
                                        />
                                        <small className="text-muted mt-1 d-block">{t('comma_separator_tip')}</small>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-1 mt-4">
                                    <Plus size={16} /> {t('btn_add_to_library')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card shadow-sm">
                        <div className="card-header bg-dark text-white fw-bold d-flex align-items-center gap-2">
                            <Layers size={18} />
                            <span>{t('global_library_title')}</span>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="p-5 text-center text-muted">{t('loading_attributes')}</div>
                            ) : attributes.length === 0 ? (
                                <div className="p-5 text-center text-muted">{t('empty_attributes')}</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                        <tr>
                                            <th>{t('th_attr_name')}</th>
                                            <th>{t('th_attr_cat')}</th>
                                            <th>{t('th_attr_desc')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {attributes.map((attr) => (
                                            <tr key={attr.id}>
                                                <td>
                                                    <div className="fw-bold text-primary">{attr.name}</div>
                                                    {attr.options && (
                                                        <div className="mt-1">
                                                            {attr.options.map((opt) => (
                                                                <span key={opt} className="badge bg-light text-dark border me-1 small">{opt}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="badge bg-secondary d-block mb-1">{attr.category}</span>
                                                    <span className="small text-muted d-block text-center border rounded bg-light">{attr.type}</span>
                                                </td>
                                                <td className="small text-secondary">{attr.description}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};