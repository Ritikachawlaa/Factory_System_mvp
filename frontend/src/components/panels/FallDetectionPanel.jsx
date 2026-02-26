import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';

const FallDetectionPanel = ({ cameraId }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch events specifically for Fall Detection on this camera
                const res = await httpClient.get('/events', {
                    params: { camera_id: cameraId, module_key: 'fall-detection' }
                });
                setAlerts(res.data || []);
            } catch (e) {
                console.error("Failed to fetch Fall Detection logs", e);
            }
            setLoading(false);
        };
        fetchData();
    }, [cameraId]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="glass-panel" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Fall Detection</h3>
                        <span style={{
                            fontSize: '0.8rem',
                            color: alerts.length > 0 ? '#ef4444' : 'var(--success-color)',
                            background: alerts.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px'
                        }}>
                            {alerts.length === 0 ? '● Systems Normal' : '● FALL DETECTED'}
                        </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Instant medical alert system active.
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    <h4 style={{ margin: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>INCIDENT LOG</h4>

                    {loading && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}

                    {!loading && alerts.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No falls detected in the recent period.
                        </div>
                    )}

                    {!loading && alerts.map((a, i) => (
                        <div key={i} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem' }}>{a.label || 'Fall Incident'}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{new Date(a.timestamp || Date.now()).toLocaleTimeString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{a.message || 'Immediate response required'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FallDetectionPanel;
