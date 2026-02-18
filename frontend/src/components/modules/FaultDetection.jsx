import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';
import faultDetectionApi from '../../api/faultDetection.api';

const FaultDetection = () => {
    const [events, setEvents] = useState([]);
    const [detectionRate, setDetectionRate] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detectionsRes, statsRes] = await Promise.allSettled([
                    faultDetectionApi.getDetections({ limit: 20 }),
                    faultDetectionApi.getStats()
                ]);
                if (detectionsRes.status === 'fulfilled') {
                    const data = detectionsRes.value?.data || detectionsRes.value || [];
                    setEvents(Array.isArray(data) ? data : []);
                }
                if (statsRes.status === 'fulfilled') {
                    const statsData = statsRes.value?.data || statsRes.value || {};
                    setDetectionRate(statsData.detection_rate ?? 0);
                }
            } catch (e) {
                console.error('Failed to fetch fault detection data', e);
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
            await faultDetectionApi.acknowledgeAlert(alertId);
            setEvents(prev => prev.filter(e => e.id !== alertId));
        } catch (e) {
            console.error('Failed to acknowledge fault', e);
        }
    };

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>System Status</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success-color)' }}></div>
                    <span style={{ color: '#fff', fontSize: '0.9rem' }}>Sensors Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success-color)' }}></div>
                    <span style={{ color: '#fff', fontSize: '0.9rem' }}>AI Model Running</span>
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Detection Rate</h3>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', color: detectionRate > 90 ? 'var(--success-color)' : '#f59e0b', fontWeight: 'bold' }}>
                        {detectionRate}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Accuracy Score</div>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Fault Detection" videoModules="fault_detection" rightPanelContent={<RightPanelContent />}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Active Faults Log</h3>
                {loading ? (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Loading...</div>
                ) : events.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No recent faults detected.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {events.map((e) => (
                            <div key={e.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
                                borderLeft: `3px solid ${(e.severity === 'Critical' || e.severity === 'High') ? '#ef4444' : '#eab308'}`
                            }}>
                                <div>
                                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{e.type || e.detection_type || 'Fault'}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{e.description || e.message || ''}</div>
                                    <div style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem', marginTop: '4px' }}>
                                        {e.operator ? `Op: ${e.operator}` : ''} {e.timestamp || e.created_at || ''}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <div style={{
                                        fontSize: '0.75rem', fontWeight: 'bold',
                                        color: (e.severity === 'Critical' || e.severity === 'High') ? '#ef4444' : '#eab308',
                                        padding: '2px 6px',
                                        background: (e.severity === 'Critical' || e.severity === 'High') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                        borderRadius: '4px'
                                    }}>{e.severity || 'Warning'}</div>
                                    <button onClick={() => handleAcknowledge(e.id)} style={{
                                        padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)',
                                        color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem'
                                    }}>Dismiss</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ModulePage>
    );
};

export default FaultDetection;
