import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';

const EntryExitPanel = ({ cameraId }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lineY, setLineY] = useState(200);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch events specifically for Entry/Exit on this camera
                const [eventsRes, modulesRes] = await Promise.all([
                    httpClient.get('/events', { params: { camera_id: cameraId, module_key: 'entry-exit' } }),
                    httpClient.get(`/api/cameras/${cameraId}/modules`)
                ]);
                setEvents(eventsRes || []);
                if (modulesRes) {
                    const module = modulesRes.find(m => m.key === 'entry-exit');
                    if (module) {
                        const config = typeof module.config === 'string' ? JSON.parse(module.config) : (module.config || {});
                        if (config.line_y !== undefined) setLineY(config.line_y);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch Entry/Exit logs", e);
            }
            setLoading(false);
        };
        fetchData();

        // Optional: Poll every 10 seconds for new entry/exit events
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [cameraId]);

    const handleConfigChange = async (key, val) => {
        try {
            const modulesRes = await httpClient.get(`/api/cameras/${cameraId}/modules`);
            const module = modulesRes.find(m => m.key === 'entry-exit') || {};
            const currentConfig = typeof module.config === 'string' ? JSON.parse(module.config) : (module.config || {});

            await httpClient.patch(`/api/cameras/${cameraId}/modules/entry-exit`, {
                enabled: true,
                status: 'active',
                config: { ...currentConfig, [key]: parseInt(val, 10) }
            });
        } catch (e) {
            console.error(`Failed to update entry-exit config: ${key}`, e);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="glass-panel" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Entry/Exit Log</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                            {events.length === 0 ? '● Standby' : '● Processing'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tripwire Position (Y):</span>
                            <input
                                type="number"
                                value={lineY}
                                onChange={(e) => {
                                    setLineY(e.target.value);
                                    handleConfigChange('line_y', e.target.value);
                                }}
                                style={{ width: '60px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', color: '#fff', padding: '2px 4px', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Real-time human traffic flow tracking across monitored tripwires.
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    <h4 style={{ margin: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>CROSSING EVENTS</h4>

                    {loading && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}

                    {!loading && events.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No entry or exit events recorded recently.
                        </div>
                    )}

                    {!loading && events.map((e, i) => (
                        <div key={i} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ color: e.label.includes("Entry") ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '0.9rem' }}>{e.label || 'Zone Event'}</span>
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

export default EntryExitPanel;
