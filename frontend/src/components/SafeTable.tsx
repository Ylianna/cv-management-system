import React, {useState} from 'react';
import {Eye, Edit, Trash2} from 'lucide-react';

interface TableRowData {
    id: string;
    name: string;
    position: string;
    level: string;
}

interface SafeTableProps {
    data: TableRowData[];
    onView: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (ids: string[]) => void;
}

export const SafeTable: React.FC<SafeTableProps> = ({data, onView, onEdit, onDelete}) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(data.map(item => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(item => item !== id));
        }
    };

    return (
        <div className="w-100">
            <div
                className={`shadow-sm rounded p-3 mb-3 bg-light border align-items-center justify-content-between transition-all ${
                    selectedIds.length > 0 ? 'd-flex' : 'd-none'
                }`}
                style={{minHeight: '60px'}}
            >
        <span className="text-muted small fw-bold">
          Выбрано элементов: {selectedIds.length}
        </span>
                <div className="d-flex gap-2">
                    {selectedIds.length === 1 && (
                        <>
                            <button
                                onClick={() => onView(selectedIds[0])}
                                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                            >
                                <Eye size={16}/> Просмотр
                            </button>
                            <button
                                onClick={() => onEdit(selectedIds[0])}
                                className="btn btn-sm btn-warning text-white d-inline-flex align-items-center gap-1"
                            >
                                <Edit size={16}/> Редактировать
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => {
                            onDelete(selectedIds);
                            setSelectedIds([]);
                        }}
                        className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
                    >
                        <Trash2 size={16}/> Удалить
                    </button>
                </div>
            </div>

            <div className="table-responsive border rounded shadow-sm">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                    <tr>
                        <th style={{width: '40px'}} className="text-center">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                onChange={handleSelectAll}
                                checked={selectedIds.length === data.length && data.length > 0}
                            />
                        </th>
                        <th>Имя</th>
                        <th>Позиция</th>
                        <th>Уровень</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((row) => {
                        const isSelected = selectedIds.includes(row.id);
                        return (
                            <tr key={row.id} className={isSelected ? 'table-primary' : ''}>
                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={isSelected}
                                        onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                                    />
                                </td>
                                <td className="fw-semibold">{row.name}</td>
                                <td>{row.position}</td>
                                <td>
                    <span className={`badge ${
                        row.level === 'Senior' ? 'bg-danger' : row.level === 'Middle' ? 'bg-warning text-dark' : 'bg-success'
                    }`}>
                      {row.level}
                    </span>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};