import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';

const IntrusionDetection = () => {
    const [zones, setZones] = useState([]);

    useEffect(() => {
        setZones([
            { id: 1, name: 'Perimeter Fence', status: 'Secure', lastCheck: 'Just now' },
            { id: 2, name: 'Server Room', status: 'Secure', lastCheck: '2 mins ago' },
            { id: 3, name: 'Loading Bay', status: 'Breach Attempt', lastCheck: '10 mins ago', type: 'warning', detected: 'Unknown Person' },
            { id: 4, name: 'Roof Access', status: 'Secure', lastCheck: '5 mins ago' },
        ]);
    }, []);

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Global Security Level</h3>
                <div style={{
                    padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '8px', textAlign: 'center', color: '#f59e0b'
                }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>ELEVATED</div>
                    <div style={{ fontSize: '0.8rem' }}>Monitoring Active Breaches</div>
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Guards</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>4</div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Intrusion & Perimeter Security" videoModules="intrusion_detection" rightPanelContent={<RightPanelContent />}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Zone Status Monitor</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {zones.map(z => (
                        <div key={z.id} style={{
                            background: z.type === 'warning' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${z.type === 'warning' ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '12px', padding: '1.25rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: '#fff', fontWeight: '500' }}>{z.name}</span>
                                {z.type === 'warning' ?
                                    <span style={{ fontSize: '1.2rem' }}>⚠️</span> :
                                    <span style={{ color: 'var(--success-color)' }}>✓</span>
                                }
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '0.8rem',
                                    color: z.type === 'warning' ? '#ef4444' : 'var(--success-color)',
                                    fontWeight: 'bold', textTransform: 'uppercase'
                                }}>{z.status}</span>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{z.lastCheck}</div>
                                    {z.detected && <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '2px' }}>Detected: {z.detected}</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ModulePage>
    );
};

export default IntrusionDetection;
