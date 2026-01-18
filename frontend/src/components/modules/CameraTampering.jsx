import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';

const CameraTampering = () => {
    const [cameras, setCameras] = useState([]);

    useEffect(() => {
        setCameras([
            { id: 1, name: 'Main Gate', status: 'Online', signal: 95, lastAccess: 'Guard: D. Wilson (09:10)' },
            { id: 2, name: 'Warehouse Entry', status: 'Online', signal: 88, lastAccess: 'Staff: M. Ali (10:05)' },
            { id: 3, name: 'Back Alley', status: 'Occluded', signal: 40, lastAccess: 'Unknown (11:00)' },
            { id: 4, name: 'Parking Lot', status: 'Signal Loss', signal: 0, lastAccess: 'None' },
        ]);
    }, []);

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Diagnostics</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>System Uptime</span>
                    <span style={{ color: '#fff' }}>24d 13h</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Bandwidth</span>
                    <span style={{ color: '#fff' }}>124 MB/s</span>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Camera Tampering & Integrity" videoModules="camera_tampering" rightPanelContent={<RightPanelContent />}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Camera Network Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {cameras.map(cam => (
                        <div key={cam.id} style={{
                            background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem',
                            border: `1px solid ${cam.status === 'Online' ? 'rgba(74, 222, 128, 0.2)' : cam.status === 'Occluded' ? 'rgba(250, 204, 21, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: '#fff', fontWeight: '500' }}>{cam.name}</span>
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: cam.status === 'Online' ? 'var(--success-color)' : cam.status === 'Occluded' ? '#f59e0b' : '#ef4444'
                                }}></div>
                            </div>

                            <div style={{ marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                    <span>Signal Strength</span>
                                    <span>{cam.signal}%</span>
                                </div>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${cam.signal}%`, height: '100%',
                                        background: cam.signal > 60 ? 'var(--accent-cyan)' : '#ef4444'
                                    }}></div>
                                </div>
                            </div>

                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Status: <span style={{ color: cam.status === 'Online' ? 'var(--success-color)' : '#fff' }}>{cam.status}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.5rem' }}>
                                Last Access: {cam.lastAccess}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ModulePage>
    );
};

export default CameraTampering;
