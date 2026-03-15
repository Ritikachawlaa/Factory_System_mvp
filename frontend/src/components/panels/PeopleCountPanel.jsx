import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';

const PeopleCountPanel = ({ cameraId }) => {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const res = await httpClient.get(`/api/cameras/${cameraId}/people-timeline`);
                setTimeline(res);
            } catch (err) {
                console.error("Error fetching people count timeline panel:", err);
            } finally {
                setLoading(false);
            }
        };

        if (cameraId) {
            fetchTimeline();
            const interval = setInterval(fetchTimeline, 15000); // 15s refresh
            return () => clearInterval(interval);
        }
    }, [cameraId]);

    const formatTime = (dateStr) => {
        if (!dateStr) return '--:--:--';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Invalid Time';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="glass-panel" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>People Count Activity</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--success-color)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>● Tracking</span>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    {loading && <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading activity...</div>}

                    {!loading && (!timeline || timeline.length === 0) && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            No counting events logged today.
                        </div>
                    )}

                    {!loading && timeline && timeline.map((entry, i) => (
                        <div key={i} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{formatTime(entry.time)}</span>
                                <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 'bold' }}>Update</span>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                {entry.meta && typeof entry.meta === 'object' ? entry.meta.message : (entry.meta || 'Count changed')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PeopleCountPanel;
