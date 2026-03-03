import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';
import fireSmokeApi from '../../api/firesmoke.api';

const FireSmokeDetection = () => {
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detectionsRes, statsRes] = await Promise.allSettled([
                    fireSmokeApi.getDetections({ limit: 20 }),
                    fireSmokeApi.getStats()
                ]);
                if (detectionsRes.status === 'fulfilled') setAlerts(detectionsRes.value?.data || detectionsRes.value || []);
                if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data || statsRes.value || null);
            } catch (e) {
                console.error('Failed to fetch fire/smoke data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleAcknowledge = async (alertId) => {
        try {
            await fireSmokeApi.acknowledgeAlert(alertId);
            setAlerts(prev => prev.filter(a => a.id !== alertId));
        } catch (e) {
            console.error('Failed to acknowledge alert', e);
        }
    };

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Fire Safety Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Active Alerts</div>
                        <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.5rem' }}>{alerts.length}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</div>
                        <div style={{ color: alerts.length > 0 ? '#ef4444' : 'var(--success-color)', fontWeight: 'bold', fontSize: '1rem' }}>
                            {alerts.length > 0 ? '⚠ ALERT' : '✓ SAFE'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Fire & Smoke Detection" videoModules="fire-smoke-detection" rightPanelContent={<RightPanelContent />}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Fire Safety Alerts</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading alerts...</div>
                ) : alerts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No active fire or smoke alerts.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {alerts.map((alert) => (
                            <div key={alert.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)',
                                borderLeft: '3px solid #ef4444', borderRadius: '8px'
                            }}>
                                <div>
                                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>
                                        🔥 {alert.type || alert.detection_type || 'Fire/Smoke'}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {alert.message || alert.location || 'Detection event'}
                                    </div>
                                </div>
                                <button onClick={() => handleAcknowledge(alert.id)} style={{
                                    padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.1)',
                                    color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
                                }}>Dismiss</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ModulePage>
    );
};

export default FireSmokeDetection;
