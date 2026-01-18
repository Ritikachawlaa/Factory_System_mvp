import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';

const FightDetection = () => {
    const [alerts, setAlerts] = useState([]);
    const [safetyScore, setSafetyScore] = useState(100);

    useEffect(() => {
        setAlerts([
            { id: 1, type: 'Aggressive Behavior', location: 'Lobby', severity: 'Medium', timestamp: '10:45 AM', person: 'Unknown' },
            { id: 2, type: 'Crowd Gathering', location: 'Gate 2', severity: 'Low', timestamp: '11:20 AM', person: 'Staff: A. Davis' }
        ]);
        setSafetyScore(92);
    }, []);

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
                    <div style={{ position: 'relative', borderLeft: '2px solid var(--panel-border)', marginLeft: '0.5rem', paddingLeft: '1.5rem' }}>
                        {alerts.map((a, idx) => (
                            <div key={a.id} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', left: '-2.15rem', top: '0',
                                    width: '12px', height: '12px', borderRadius: '50%',
                                    background: a.severity === 'High' ? '#ef4444' : '#f59e0b',
                                    border: '2px solid var(--bg-dark)'
                                }}></div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ color: '#fff', fontWeight: '500' }}>{a.type}</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{a.timestamp}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{a.location}</div>
                                    <div style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Detected: {a.person}</div>
                                </div>
                            </div>
                        ))}
                    </div>
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
                        Current environment is relatively safe.
                    </div>
                </div>
            </div>
        </ModulePage>
    );
};

export default FightDetection;
