import React, {useState, useEffect} from 'react';
import {TagCloud} from 'react-tagcloud';
import {Briefcase, BarChart2, Star, TrendingUp} from 'lucide-react';
import {useTranslation} from "react-i18next";
import {BACKEND_URL} from '../constants/api';

interface Stats {
    totalPositions: number;
    totalCVs: number;
    cvsLast24h: number;
    totalCandidates: number;
    totalRecruiters: number;
}

export const MainPage: React.FC = () => {
    const {t} = useTranslation();
    const [stats, setStats] = useState<Stats | null>(null);
    const [latest, setLatest] = useState<any[]>([]);
    const [popular, setPopular] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/main-stats`)
            .then(res => res.json())
            .then(data => {
                setStats(data.statistics);
                setLatest(data.latestPositions || []);
                setPopular(data.popularPositions || []);
                setTags(data.tagCloudData || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleTagClick = (tag: { value: string; count: number }) => {
        const searchInput = document.querySelector('input[placeholder*="search"]') as HTMLInputElement;
        if (searchInput) {
            searchInput.value = tag.value;
            searchInput.dispatchEvent(new Event('input', {bubbles: true}));
        }
    };

    if (loading) return <div className="p-5 text-center text-muted">{t('loading_analytics')}</div>;

    return (
        <div className="container py-4">
            <div className="row g-3 mb-5">
                <h4 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3"><BarChart2
                    className="text-primary"/> {t('stats_title')}</h4>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 bg-primary text-white p-3 rounded-3 text-center">
                        <h2 className="fw-extrabold m-0">{stats?.cvsLast24h}</h2>
                        <small className="opacity-90">{t('stats_last24h')}</small>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 bg-dark text-white p-3 rounded-3 text-center">
                        <h2 className="fw-extrabold m-0">{stats?.totalPositions}</h2>
                        <small className="opacity-90">{t('stats_active_pos')}</small>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 bg-success text-white p-3 rounded-3 text-center">
                        <h2 className="fw-extrabold m-0">{stats?.totalCVs}</h2>
                        <small className="opacity-90">{t('stats_total_cvs')}</small>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-light fw-bold text-dark d-flex align-items-center gap-2 py-3">
                            <Briefcase size={18} className="text-warning"/> <span>{t('latest_vacancies')}</span>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0 small">
                                    <thead className="table-light">
                                    <tr>
                                        <th>{t('table_col_title')}</th>
                                        <th>{t('table_col_desc')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {latest.map(p => (
                                        <tr key={p.id}>
                                            <td className="fw-bold text-primary">{p.title}</td>
                                            <td className="text-muted">{p.description.substring(0, 90)}...</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-header bg-light fw-bold text-dark d-flex align-items-center gap-2 py-3">
                            <Star size={18} className="text-danger"/> <span>{t('top_vacancies')}</span>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0 small">
                                    <thead className="table-light">
                                    <tr>
                                        <th>{t('table_col_rank')}</th>
                                        <th>{t('table_col_title')}</th>
                                        <th className="text-center">{t('table_col_cv_count')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {popular.map((p, index) => (
                                        <tr key={p.id}>
                                            <td className="fw-bold text-center text-secondary"
                                                style={{width: '60px'}}>#{index + 1}</td>
                                            <td className="fw-bold text-dark">{p.title}</td>
                                            <td className="text-center"><span
                                                className="badge bg-danger p-2">{p.cvCount || 0} CV</span></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-light fw-bold text-dark d-flex align-items-center gap-2 py-3">
                            <TrendingUp size={18} className="text-success"/> <span>{t('tag_cloud_title')}</span>
                        </div>
                        <div
                            className="card-body d-flex align-items-center justify-content-center p-4 bg-white rounded-bottom">
                            {tags.length === 0 ? (
                                <small className="text-muted italic">{t('tag_cloud_empty')}</small>
                            ) : (
                                <div className="text-center">
                                    <TagCloud
                                        minSize={12}
                                        maxSize={32}
                                        tags={tags}
                                        onClick={handleTagClick}
                                        className="cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};