import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';
import fightDetectionApi from '../../api/fightDetection.api';

const FightDetection = () => {
    const [alerts, setAlerts] = useState([]);
    const [safetyScore, setSafetyScore] = useState(100);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detectionsRes, statsRes] = await Promise.allSettled([
                    fightDetectionApi.getDetections({ limit: 20 }),
                    fightDetectionApi.getStats()
                ]);
                if (detectionsRes.status === 'fulfilled') {
                    const data = detectionsRes.value?.data || detectionsRes.value || [];
                    setAlerts(Array.isArray(data) ? data : []);
                }
                if (statsRes.status === 'fulfilled') {
                    const statsData = statsRes.value?.data || statsRes.value || {};
                    setSafetyScore(statsData.safety_score ?? 100);
                }
            } catch (e) {
                console.error('Failed to fetch fight detection data', e);
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
            await fightDetectionApi.acknowledgeAlert(alertId);
            setAlerts(prev => prev.filter(a => a.id !== alertId));
        } catch (e) {
            console.error('Failed to acknowledge alert', e);
        }
    };

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Security Protocol</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button style={{
                        padding: '0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px',
                        cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}>
                        <span>🚨</span> Trigger Alarm
                    </button>
                    <button style={{
                        padding: '0.75rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid var(--panel-border)', borderRadius: '6px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}>
                        <span>👮</span> Notify Security
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Aggressive Behaviour & Fight Detection" videoModules="fight_detection" rightPanelContent={<RightPanelContent />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Recent Incidents Timeline</h3>
                    {loading ? (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Loading...</div>
                    ) : alerts.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No incidents detected.</div>
                    ) : (
                        <div style={{ position: 'relative', borderLeft: '2px solid var(--panel-border)', marginLeft: '0.5rem', paddingLeft: '1.5rem' }}>
                            {alerts.map((a) => (
                                <div key={a.id} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: '-2.15rem', top: '0',
                                        width: '12px', height: '12px', borderRadius: '50%',
                                        background: (a.severity === 'High' || a.severity === 'Critical') ? '#ef4444' : '#f59e0b',
                                        border: '2px solid var(--bg-dark)'
                                    }}></div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ color: '#fff', fontWeight: '500' }}>{a.type || a.detection_type || 'Incident'}</span>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{a.timestamp || a.created_at || ''}</span>
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{a.location || a.message || ''}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                            <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>Detected: {a.person || 'Unknown'}</span>
                                            <button onClick={() => handleAcknowledge(a.id)} style={{
                                                padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)',
                                                color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem'
                                            }}>Dismiss</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Threat Level Analysis</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                        <div style={{
                            width: '180px', height: '180px', borderRadius: '50%',
                            border: '15px solid rgba(255,255,255,0.05)',
                            borderTop: `15px solid ${safetyScore < 90 ? '#ef4444' : 'var(--success-color)'}`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>{safetyScore}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Safety Score</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {safetyScore >= 90 ? 'Current environment is relatively safe.' : '⚠ Elevated threat level detected.'}
                    </div>
                </div>
            </div>
        </ModulePage>
    );
};

export default FightDetection;
