import React, { useEffect, useState } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import VideoFeed from '../VideoFeed';
import faceDetectionApi from '../../api/faceDetection.api';

const FaceDetection = () => {
    const [detections, setDetections] = useState([]);
    const [stats, setStats] = useState({ today_total: 0, accuracy: '98.5%', active_cameras: 4, status: 'Active' });
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detectionsRes, statsRes] = await Promise.allSettled([
                    faceDetectionApi.getDetections({ limit: 12 }),
                    faceDetectionApi.getStats()
                ]);

                if (detectionsRes.status === 'fulfilled') {
                    const data = detectionsRes.value?.data || detectionsRes.value || [];
                    setDetections(Array.isArray(data) ? data : []);
                }

                if (statsRes.status === 'fulfilled') {
                    const sData = statsRes.value?.data || statsRes.value;
                    if (sData) {
                        setStats(prev => ({ ...prev, ...sData }));
                    }
                }
            } catch (e) {
                console.error('Failed to fetch face detection data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 4000);
        return () => clearInterval(interval);
    }, []);

    const getSeverityColor = (conf) => {
        if (conf > 0.8) return 'var(--success-color)';
        if (conf > 0.6) return 'var(--accent-cyan)';
        return '#f59e0b';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <Sidebar />

                <div style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                    background: 'radial-gradient(circle at 50% 10%, rgba(168, 85, 247, 0.15) 0%, transparent 60%)'
                }}>
                    {/* Page Header */}
                    <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }} className="text-gradient">
                                Face Intelligence Center
                            </h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="glass-panel" style={{ padding: '0.75rem 1.5rem' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Analysis Probe</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>● {stats.status || 'Active'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        {[
                            { label: "Total Faces Detected", value: stats.today_total, icon: '😊', color: '#a855f7' },
                            { label: 'Model Precision', value: stats.accuracy, icon: '🎯', color: 'var(--success-color)' },
                            { label: 'Active Sensors', value: stats.active_cameras, icon: '📹', color: 'var(--accent-cyan)' },
                            { label: 'Scanning Rate', value: '30 FPS', icon: '⚡', color: '#f59e0b' }
                        ].map((item, idx) => (
                            <div key={idx} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${item.color}` }}>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{item.label}</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginTop: '0.5rem' }}>{item.value}</div>
                                </div>
                                <div style={{ fontSize: '2rem', opacity: 0.8 }}>{item.icon}</div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>

                        {/* Large Video Stream */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between' }}>
                                    <h3 style={{ margin: 0, color: '#fff' }}>Primary Intelligence Stream</h3>
                                    <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.8rem' }}>● LIVE DETECTION</span>
                                </div>
                                <div style={{ aspectRatio: '16/9', background: '#000', position: 'relative' }}>
                                    <VideoFeed modules="face-detection" />
                                    {/* Subtitle overlay */}
                                    <div style={{
                                        position: 'absolute', bottom: '1rem', left: '1rem',
                                        color: '#fff', fontSize: '0.8rem', background: 'rgba(0,0,0,0.5)',
                                        padding: '4px 10px', borderRadius: '4px'
                                    }}>
                                        AI Processor: NVIDIA Jetson Optimized
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info / Mini Stats */}
                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Detection Performance</h4>
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>12ms</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>LATENCY</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>99.8%</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>UPTIME</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Intelligence Log */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'fit-content', maxHeight: '100%' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Intelligence Log</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                                {loading ? (
                                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Loading logs...</div>
                                ) : detections.length === 0 ? (
                                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No detections recorded yet.</div>
                                ) : (
                                    detections.map((d, i) => (
                                        <div key={i} style={{
                                            padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                                            borderLeft: `4px solid ${getSeverityColor(d.confidence || 0.9)}`,
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            transition: 'transform 0.2s'
                                        }} className="hover-highlight">
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{d.label || 'Face Intelligence'}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                    {d.camera_name || 'Front Entry'} • {d.timestamp?.split(' ')?.pop()?.substring(0, 8)}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: getSeverityColor(d.confidence), fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    {(d.confidence * 100).toFixed(0)}%
                                                </div>
                                                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Confidence</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FaceDetection;
