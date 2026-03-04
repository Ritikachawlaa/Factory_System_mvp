import React, { useEffect, useMemo, useState } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import VideoFeed from '../VideoFeed';
import camerasApi from '../../api/cameras.api';
import httpClient from '../../api/httpClient';
import FaceAnalyticsDashboard from '../analytics/FaceAnalyticsDashboard';

const FaceRecognition = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState(null);
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({
        recognized_today: 0,
        unknowns: 0,
        avg_duration: 0,
        peak_hour: '--:--',
        status: 'Active'
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchCams = async () => {
            try {
                const results = await camerasApi.getAll();
                setCameras(results);
                if (results.length > 0) {
                    setSelectedCameraId(results[0].id);
                }
            } catch (e) {
                console.error('Failed to load cameras', e);
            }
        };
        fetchCams();
    }, []);

    useEffect(() => {
        if (!selectedCameraId) return;

        const fetchFaceData = async () => {
            try {
                const [statsRes, timelineRes] = await Promise.all([
                    httpClient.get(`/api/cameras/${selectedCameraId}/face-stats`),
                    httpClient.get('/events', { params: { camera_id: selectedCameraId, module_key: 'face-recognition', limit: 20 } })
                ]);

                const timeline = Array.isArray(timelineRes) ? timelineRes : [];
                const unknowns = timeline.filter((e) => {
                    const label = (e.label || '').toLowerCase();
                    return label.includes('unknown') || label.includes('visitor');
                }).length;

                const peak = statsRes?.peak_hour;
                const peakHour = peak === null || peak === undefined ? '--:--' : `${String(peak).padStart(2, '0')}:00`;

                setEvents(timeline);
                setStats({
                    recognized_today: statsRes?.total_faces || 0,
                    unknowns,
                    avg_duration: statsRes?.avg_duration || 0,
                    peak_hour: peakHour,
                    status: 'Active'
                });
            } catch (e) {
                console.error('Failed to load face recognition analytics', e);
            }
        };

        fetchFaceData();
        const interval = setInterval(fetchFaceData, 15000);
        return () => clearInterval(interval);
    }, [selectedCameraId]);

    const topEvents = useMemo(() => events.slice(0, 8), [events]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <Sidebar />
                <div
                    style={{
                        flex: 1,
                        padding: '2rem',
                        overflowY: 'auto',
                        background: 'radial-gradient(circle at 50% 10%, rgba(30, 58, 138, 0.15) 0%, transparent 60%)'
                    }}
                >
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div
                                style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    marginBottom: '0.25rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}
                            >
                                {currentTime.toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }} className="text-gradient">
                                Face Recognition Analytics
                            </h2>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <select
                                value={selectedCameraId || ''}
                                onChange={(e) => setSelectedCameraId(Number(e.target.value))}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--panel-border)',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    padding: '0.55rem 0.9rem',
                                    minWidth: '220px'
                                }}
                            >
                                {cameras.map((cam) => (
                                    <option key={cam.id} value={cam.id}>
                                        {cam.name || `Camera ${cam.id}`}
                                    </option>
                                ))}
                            </select>
                            <div className="glass-panel" style={{ padding: '0.75rem 1rem' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Engine</div>
                                <div style={{ fontSize: '1rem', color: 'var(--success-color)', fontWeight: 'bold' }}>? {stats.status}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Recognized Today', value: stats.recognized_today, color: '#10b981' },
                            { label: 'Unknown (Recent)', value: stats.unknowns, color: '#ef4444' },
                            { label: 'Avg Duration', value: `${stats.avg_duration}s`, color: '#3b82f6' },
                            { label: 'Peak Hour', value: stats.peak_hour, color: '#a855f7' }
                        ].map((item, idx) => (
                            <div key={idx} className="glass-panel" style={{ padding: '1rem', borderLeft: `4px solid ${item.color}` }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.label}</div>
                                <div style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700 }}>{item.value}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                            <div
                                style={{
                                    padding: '1rem 1.25rem',
                                    borderBottom: '1px solid var(--panel-border)',
                                    color: '#fff',
                                    fontWeight: 600
                                }}
                            >
                                Live Face Recognition Feed
                            </div>
                            <div style={{ aspectRatio: '16/9', background: '#000' }}>
                                {selectedCameraId && <VideoFeed modules="face-recognition" cameraId={selectedCameraId} />}
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
                            <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.75rem' }}>Recent Recognition Events</div>
                            {topEvents.length === 0 ? (
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No recent events.</div>
                            ) : (
                                topEvents.map((evt, idx) => (
                                    <div key={idx} style={{ padding: '0.7rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>{evt.label || 'Face event'}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                            {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : '-'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {selectedCameraId && <FaceAnalyticsDashboard cameraId={selectedCameraId} />}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FaceRecognition;
