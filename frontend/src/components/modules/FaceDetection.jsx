import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';
import faceDetectionApi from '../../api/faceDetection.api';

const FaceDetection = () => {
    const [detections, setDetections] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detectionsRes, statsRes] = await Promise.allSettled([
                    faceDetectionApi.getDetections({ limit: 20 }),
                    faceDetectionApi.getStats()
                ]);
                if (detectionsRes.status === 'fulfilled') {
                    const data = detectionsRes.value?.data || detectionsRes.value || [];
                    setDetections(Array.isArray(data) ? data : []);
                }
                if (statsRes.status === 'fulfilled') {
                    setStats(statsRes.value?.data || statsRes.value || null);
                }
            } catch (e) {
                console.error('Failed to fetch face detection data', e);
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
            await faceDetectionApi.acknowledgeAlert(alertId);
            setDetections(prev => prev.filter(d => d.id !== alertId));
        } catch (e) {
            console.error('Failed to acknowledge', e);
        }
    };

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Face Detection Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Faces Detected</div>
                        <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '1.5rem' }}>{detections.length}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Accuracy</div>
                        <div style={{ color: 'var(--success-color)', fontWeight: 'bold', fontSize: '1rem' }}>{stats?.accuracy || '—'}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Face Detection" videoModules="face_detection" rightPanelContent={<RightPanelContent />}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Detection Log</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : detections.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No face detections recorded yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {detections.map((d) => (
                            <div key={d.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.75rem', background: 'rgba(168, 85, 247, 0.08)',
                                borderLeft: '3px solid #a855f7', borderRadius: '8px'
                            }}>
                                <div>
                                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>
                                        😊 {d.type || d.detection_type || 'Face Detected'}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {d.message || d.location || 'Detection event'}
                                    </div>
                                    <div style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', marginTop: '2px' }}>
                                        {d.timestamp || d.created_at || ''}
                                    </div>
                                </div>
                                <button onClick={() => handleAcknowledge(d.id)} style={{
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

export default FaceDetection;
