import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';
import labourCountingApi from '../../api/labourCounting.api';

const LabourCounting = () => {
    const [counts, setCounts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detectionsRes, statsRes] = await Promise.allSettled([
                    labourCountingApi.getDetections({ limit: 30 }),
                    labourCountingApi.getStats()
                ]);
                if (detectionsRes.status === 'fulfilled') {
                    const data = detectionsRes.value?.data || detectionsRes.value || [];
                    setCounts(Array.isArray(data) ? data : []);
                }
                if (statsRes.status === 'fulfilled') {
                    setStats(statsRes.value?.data || statsRes.value || null);
                }
            } catch (e) {
                console.error('Failed to fetch labour counting data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const totalWorkers = stats?.total_workers || counts.reduce((sum, c) => sum + (c.count || 0), 0);

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Workforce Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>On Site</div>
                        <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '1.5rem' }}>{totalWorkers}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Zones Active</div>
                        <div style={{ color: 'var(--success-color)', fontWeight: 'bold', fontSize: '1rem' }}>{counts.length}</div>
                    </div>
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Shift Info</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Current Shift</span>
                    <span style={{ color: '#fff' }}>{stats?.current_shift || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Expected</span>
                    <span style={{ color: '#fff' }}>{stats?.expected_workers || '—'}</span>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Labour Counting" videoModules="labour-counting" rightPanelContent={<RightPanelContent />}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Zone-wise Worker Count</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : counts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No labour count data available yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {counts.map((c, idx) => (
                            <div key={c.id || idx} style={{
                                background: 'rgba(245, 158, 11, 0.05)', borderRadius: '12px', padding: '1rem',
                                border: '1px solid rgba(245, 158, 11, 0.15)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: '#fff', fontWeight: '500' }}>
                                        👷 {c.zone || c.location || c.name || `Zone ${idx + 1}`}
                                    </span>
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', textAlign: 'center' }}>
                                    {c.count || c.worker_count || 0}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.25rem' }}>
                                    Workers
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', textAlign: 'center', marginTop: '0.5rem' }}>
                                    {c.timestamp || c.created_at || ''}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ModulePage>
    );
};

export default LabourCounting;
