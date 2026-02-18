import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';
import cameraTamperingApi from '../../api/cameraTampering.api';

const CameraTampering = () => {
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await cameraTamperingApi.getDetections({ limit: 20 });
                const data = res?.data || res || [];
                setCameras(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error('Failed to fetch camera tampering data', e);
                // Fallback to defaults if API not available yet
                setCameras([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleAcknowledge = async (alertId) => {
        try {
            await cameraTamperingApi.acknowledgeAlert(alertId);
            setCameras(prev => prev.filter(c => c.id !== alertId));
        } catch (e) {
            console.error('Failed to acknowledge tampering alert', e);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Online': return 'var(--success-color)';
            case 'Occluded': return '#f59e0b';
            default: return '#ef4444';
        }
    };

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Diagnostics</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Alerts</span>
                    <span style={{ color: '#fff' }}>{cameras.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                    <span style={{ color: cameras.length > 0 ? '#ef4444' : 'var(--success-color)' }}>
                        {cameras.length > 0 ? 'Issues Detected' : 'All Clear'}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Camera Tampering & Integrity" videoModules="camera_tampering" rightPanelContent={<RightPanelContent />}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Camera Network Status</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : cameras.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No tampering events detected. All cameras are operating normally.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {cameras.map(cam => (
                            <div key={cam.id} style={{
                                background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem',
                                border: `1px solid ${getStatusColor(cam.status)}30`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ color: '#fff', fontWeight: '500' }}>{cam.name || cam.camera_name || `Camera ${cam.id}`}</span>
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: getStatusColor(cam.status)
                                    }}></div>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Type: <span style={{ color: '#fff' }}>{cam.type || cam.detection_type || 'Tampering'}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Status: <span style={{ color: getStatusColor(cam.status) }}>{cam.status || 'Unknown'}</span>
                                </div>
                                <button onClick={() => handleAcknowledge(cam.id)} style={{
                                    marginTop: '0.75rem', width: '100%', padding: '0.4rem',
                                    background: 'rgba(255,255,255,0.1)', color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
                                    cursor: 'pointer', fontSize: '0.75rem'
                                }}>Dismiss</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ModulePage>
    );
};

export default CameraTampering;
