import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';

const FaceDetectionPanel = ({ cameraId }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch events specifically for Face Detection on this camera
                const res = await httpClient.get('/events', {
                    params: { camera_id: cameraId, module_key: 'face-detection' }
                });
                setEvents(res || []);
            } catch (e) {
                console.error("Failed to fetch Face Detection logs", e);
            }
            setLoading(false);
        };
        fetchData();

        // Optional: Poll every 10 seconds for new detection events
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [cameraId]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="glass-panel" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Face Detection</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                            {events.length === 0 ? '● Scanning Area' : '● Faces Detected'}
                        </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Real-time facial capture history and count logs.
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    <h4 style={{ margin: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>CAPTURE LOG</h4>

                    {loading && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}

                    {!loading && events.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No face detection events recorded recently.
                        </div>
                    )}

                    {!loading && events.map((e, i) => (
                        <div key={i} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '0.9rem' }}>{e.label || 'Face Detected'}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{new Date(e.timestamp || Date.now()).toLocaleTimeString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{e.meta || e.message || 'Details logged'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FaceDetectionPanel;
