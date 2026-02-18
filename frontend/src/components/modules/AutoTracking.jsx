import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';
import autoTrackingApi from '../../api/autoTracking.api';

const AutoTracking = () => {
    const [tracks, setTracks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detectionsRes, statsRes] = await Promise.allSettled([
                    autoTrackingApi.getDetections({ limit: 20 }),
                    autoTrackingApi.getStats()
                ]);
                if (detectionsRes.status === 'fulfilled') {
                    const data = detectionsRes.value?.data || detectionsRes.value || [];
                    setTracks(Array.isArray(data) ? data : []);
                }
                if (statsRes.status === 'fulfilled') {
                    setStats(statsRes.value?.data || statsRes.value || null);
                }
            } catch (e) {
                console.error('Failed to fetch auto tracking data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Tracking Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(34, 211, 238, 0.05)', border: '1px solid rgba(34, 211, 238, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Active Tracks</div>
                        <div style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '1.5rem' }}>{tracks.length}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</div>
                        <div style={{ color: 'var(--success-color)', fontWeight: 'bold', fontSize: '1rem' }}>● Tracking</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Auto Tracking" videoModules="auto_tracking" rightPanelContent={<RightPanelContent />}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Active Tracking Sessions</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : tracks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No active tracking sessions.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {tracks.map((t) => (
                            <div key={t.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.75rem', background: 'rgba(34, 211, 238, 0.08)',
                                borderLeft: '3px solid #22d3ee', borderRadius: '8px'
                            }}>
                                <div>
                                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>
                                        🎯 {t.type || t.detection_type || 'Object Tracked'}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {t.message || t.location || 'Tracking active'}
                                    </div>
                                    <div style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', marginTop: '2px' }}>
                                        {t.timestamp || t.created_at || ''}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.25rem 0.5rem', background: 'rgba(34, 211, 238, 0.1)',
                                    color: '#22d3ee', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                                }}>LIVE</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ModulePage>
    );
};

export default AutoTracking;
