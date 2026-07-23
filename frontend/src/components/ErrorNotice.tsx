import React from 'react';
import {useTranslation} from 'react-i18next';
import {AlertCircle, RefreshCw} from 'lucide-react';

interface ErrorNoticeProps {
    messageKey: string;
    isCritical?: boolean;
    onClose?: () => void;
}

export const ErrorNotice: React.FC<ErrorNoticeProps> = ({messageKey, isCritical = false, onClose}) => {
    const {t} = useTranslation();

    return (
        <div
            className="alert alert-danger shadow-sm d-flex align-items-center justify-content-between p-3 mb-3 rounded-3 border-danger-subtle fade show"
            role="alert">
            <div className="d-flex align-items-center gap-2 small">
                <AlertCircle size={18} className="flex-shrink-0"/>
                <div>
                    <span className="fw-bold">{t('error_title')}: </span>
                    {t(messageKey)}
                </div>
            </div>

            <div className="d-flex gap-2">
                {isCritical ? (
                    <button
                        type="button"
                        className="btn btn-xs btn-danger d-flex align-items-center gap-1 py-1 px-2"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw size={12}/> {t('btn_reload')}
                    </button>
                ) : (
                    onClose && (
                        <button
                            type="button"
                            className="btn-close small"
                            style={{fontSize: '10px'}}
                            onClick={onClose}
                            aria-label="Close"
                        />
                    )
                )}
            </div>
        </div>
    );
};