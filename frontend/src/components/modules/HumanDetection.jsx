import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';
import humanDetectionApi from '../../api/humanDetection.api';

const HumanDetection = () => {
    const [detections, setDetections] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detectionsRes, statsRes] = await Promise.allSettled([
                    humanDetectionApi.getDetections({ limit: 20 }),
                    humanDetectionApi.getStats()
                ]);
                if (detectionsRes.status === 'fulfilled') {
                    const data = detectionsRes.value?.data || detectionsRes.value || [];
                    setDetections(Array.isArray(data) ? data : []);
                }
                if (statsRes.status === 'fulfilled') {
                    setStats(statsRes.value?.data || statsRes.value || null);
                }
            } catch (e) {
                console.error('Failed to fetch human detection data', e);
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
            await humanDetectionApi.acknowledgeAlert(alertId);
            setDetections(prev => prev.filter(d => d.id !== alertId));
        } catch (e) {
            console.error('Failed to acknowledge', e);
        }
    };

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Detection Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(96, 165, 250, 0.05)', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Detected</div>
                        <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1.5rem' }}>{detections.length}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</div>
                        <div style={{ color: 'var(--success-color)', fontWeight: 'bold', fontSize: '1rem' }}>● Active</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Human Detection" videoModules="human_detection" rightPanelContent={<RightPanelContent />}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Detection Log</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : detections.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No human detections recorded yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {detections.map((d) => (
                            <div key={d.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.75rem', background: 'rgba(96, 165, 250, 0.08)',
                                borderLeft: '3px solid #60a5fa', borderRadius: '8px'
                            }}>
                                <div>
                                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>
                                        🧍 {d.type || d.detection_type || 'Human Detected'}
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

export default HumanDetection;
