
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const HumanDetectionPanel = ({ cameraId }) => {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/cameras/${cameraId}/human-timeline`);
                setTimeline(res.data);
            } catch (err) {
                console.error("Error fetching human timeline panel:", err);
            } finally {
                setLoading(false);
            }
        };

        if (cameraId) {
            fetchTimeline();
            const interval = setInterval(fetchTimeline, 15000);
            return () => clearInterval(interval);
        }
    }, [cameraId]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="glass-panel" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Human Activity</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--success-color)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>● Live Feed</span>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    {loading && <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading activity...</div>}

                    {!loading && timeline.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            No human activity logged today.
                        </div>
                    )}

                    {!loading && timeline.map((entry, i) => (
                        <div key={i} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{entry.time}</span>
                                <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 'bold' }}>{entry.label}</span>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Detected</span>
                                <span style={{ opacity: 0.6 }}>{entry.confidence} confidence</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HumanDetectionPanel;
