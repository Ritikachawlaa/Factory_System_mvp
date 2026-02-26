import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';

const PPECompliancePanel = ({ cameraId }) => {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch events specifically for PPE on this camera
                const res = await httpClient.get('/events', {
                    params: { camera_id: cameraId, module_key: 'ppe-detection' }
                });
                setViolations(res || []);
            } catch (e) {
                console.error("Failed to fetch PPE logs", e);
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
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>PPE Compliance</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--success-color)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                            {violations.length === 0 ? '● No Violations' : '● Violation Detected'}
                        </span>
                    </div>
                    {/* Placeholder Stats - We could strictly remove these or wire them to aggregate logic if backend supported it */}
                    {/* For now, removing the random percentages to be truthful. */}
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Real-time safety monitoring active.
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    <h4 style={{ margin: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>VIOLATION LOG</h4>

                    {loading && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}

                    {!loading && violations.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No safety violations recorded recently.
                        </div>
                    )}

                    {!loading && violations.map((v, i) => (
                        <div key={i} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem' }}>{v.label || 'Violation'}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{new Date(v.timestamp || Date.now()).toLocaleTimeString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{v.message || 'Details logged'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PPECompliancePanel;
