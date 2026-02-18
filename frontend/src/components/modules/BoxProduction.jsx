import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';
import boxProductionApi from '../../api/boxProduction.api';

const BoxProduction = () => {
    const [hourlyData, setHourlyData] = useState([]);
    const [totalProduction, setTotalProduction] = useState(0);
    const [stats, setStats] = useState(null);
    const [target] = useState(300);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detectionsRes, statsRes] = await Promise.allSettled([
                    boxProductionApi.getDetections({ limit: 50 }),
                    boxProductionApi.getStats()
                ]);
                if (detectionsRes.status === 'fulfilled') {
                    const data = detectionsRes.value?.data || detectionsRes.value || [];
                    setHourlyData(Array.isArray(data) ? data : []);
                    // Calculate total from hourly data
                    if (Array.isArray(data)) {
                        const total = data.reduce((sum, d) => sum + (d.count || 0), 0);
                        setTotalProduction(total);
                    }
                }
                if (statsRes.status === 'fulfilled') {
                    const statsData = statsRes.value?.data || statsRes.value || {};
                    setStats(statsData);
                    if (statsData.total_production) setTotalProduction(statsData.total_production);
                }
            } catch (e) {
                console.error('Failed to fetch box production data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Production Target</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#fff' }}>
                        <span>Progress</span>
                        <span>{Math.round((totalProduction / target) * 100)}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min((totalProduction / target) * 100, 100)}%`, height: '100%', background: 'var(--accent-cyan)' }}></div>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                        {totalProduction} / {target} Units
                    </div>
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Efficiency Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                            {stats?.avg_rate || Math.round(totalProduction / Math.max(hourlyData.length, 1))}/hr
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg Rate</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                            {stats?.accuracy || '—'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Accuracy</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Box Production Analytics" videoModules="box_production" rightPanelContent={<RightPanelContent />}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Hourly Output</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : hourlyData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No production data available yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingTop: '1rem' }}>
                        {hourlyData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                <div style={{
                                    width: '40px',
                                    height: `${((d.count || 0) / Math.max(...hourlyData.map(h => h.count || 1))) * 100}%`,
                                    background: 'var(--accent-cyan)',
                                    borderRadius: '4px 4px 0 0',
                                    opacity: 0.8,
                                    minHeight: '4px'
                                }}></div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.time || d.hour || ''}</span>
                                <span style={{ fontSize: '0.65rem', color: '#fff' }}>{d.count || 0}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ModulePage>
    );
};

export default BoxProduction;
