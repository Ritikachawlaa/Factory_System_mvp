import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';

const LoiteringDetectionPanel = ({ cameraId }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch events specifically for Loitering Detection on this camera
                const res = await httpClient.get('/events', {
                    params: { camera_id: cameraId, module_key: 'loitering-detection' }
                });
                setEvents(res || []);
            } catch (e) {
                console.error("Failed to fetch Loitering Detection logs", e);
            }
            setLoading(false);
        };
        fetchData();

        // Optional: Poll every 10 seconds for new loitering events
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [cameraId]);

    const handleConfigChange = async (key, val) => {
        try {
            await httpClient.patch(`/api/cameras/${cameraId}/modules/loitering-detection`, {
                config: { [key]: parseInt(val, 10) }
            });
        } catch (e) {
            console.error(`Failed to update loitering config: ${key}`, e);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="glass-panel" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Loitering Detections</h3>
                        <span style={{ fontSize: '0.8rem', color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                            {events.length === 0 ? '● Standby' : '● Security Alerts'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Person Threshold:</span>
                            <input
                                type="number"
                                defaultValue={3}
                                onChange={(e) => handleConfigChange('threshold', e.target.value)}
                                style={{ width: '50px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', color: '#fff', padding: '2px 4px', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Time Limit (sec):</span>
                            <input
                                type="number"
                                defaultValue={10}
                                onChange={(e) => handleConfigChange('time_limit', e.target.value)}
                                style={{ width: '50px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', color: '#fff', padding: '2px 4px', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Time-based tracking flagging entities lingering in monitored zones over the permitted duration.
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    <h4 style={{ margin: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>SECURITY EVENTS</h4>

                    {loading && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}

                    {!loading && events.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No loitering security events recorded recently.
                        </div>
                    )}

                    {!loading && events.map((e, i) => (
                        <div key={i} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ color: '#ec4899', fontWeight: 'bold', fontSize: '0.9rem' }}>{e.label || 'Zone Violation'}</span>
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

export default LoiteringDetectionPanel;
