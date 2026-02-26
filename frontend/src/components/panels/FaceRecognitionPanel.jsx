import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';

const FaceRecognitionPanel = ({ cameraId }) => {
    const [faces, setFaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, unknown: 0 });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch events specifically for face recognition on this camera
                const res = await httpClient.get('/events', {
                    params: { camera_id: cameraId, module_key: 'face-recognition' }
                });

                const events = res || [];
                setFaces(events);

                // Calculate simple stats from the fetched batch
                const unknownCount = events.filter(e => e.label.toLowerCase().includes('unknown') || e.label.includes('Visitor')).length;
                setStats({
                    total: events.length,
                    unknown: unknownCount
                });
            } catch (e) {
                console.error("Failed to fetch face logs", e);
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
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Face Recognition</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--success-color)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>● Live Log</span>
                    </div>
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Events</div>
                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.total}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Unknown</div>
                            <div style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.unknown}</div>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    {loading && <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading logs...</div>}

                    {!loading && faces.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            No recognition events detected yet.
                        </div>
                    )}

                    {!loading && faces.map((face, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: face.label.includes('Unknown') ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                👤
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '500' }}>{face.label}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{new Date(face.timestamp || Date.now()).toLocaleTimeString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {/* Confidence or other metadata if available */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FaceRecognitionPanel;
