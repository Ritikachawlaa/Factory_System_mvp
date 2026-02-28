import React, { useEffect, useState } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import VideoFeed from '../VideoFeed';
import faceDetectionApi from '../../api/faceDetection.api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const FaceDetection = () => {
    const [detections, setDetections] = useState([]);
    const [stats, setStats] = useState({
        today_total: 0,
        accuracy: '98.5%',
        active_cameras: 4,
        status: 'Active',
        trend: { labels: [], data: [] }
    });
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

    // Prepare chart data
    const chartData = (stats.trend?.labels || []).map((label, i) => ({
        time: label,
        detections: stats.trend?.data?.[i] || 0
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-dark)' }}>
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
                    <div style={{ display: grid, gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        {[
                            { label: "Total Faces Detected", value: stats.today_total, icon: '😊', color: '#a855f7' },
                            { label: 'Model Precision', value: stats.accuracy, icon: '🎯', color: 'var(--success-color)' },
                            { label: 'Active Sensors', value: stats.active_cameras, icon: '📹', color: 'var(--accent-cyan)' },
                            { label: 'Scanning Rate', value: '30 FPS', icon: '⚡', color: '#f59e0b' }
                        ].map((item, idx) => (
                            <div key={idx} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${item.color}` }}>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{item.label}</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginTop: '0.5rem' }}>{item.value || 0}</div>
                                </div>
                                <div style={{ fontSize: '2rem', opacity: 0.8 }}>{item.icon}</div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Intelligence Stream */}
                            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between' }}>
                                    <h3 style={{ margin: 0, color: '#fff' }}>Primary Intelligence Stream</h3>
                                    <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.8rem' }}>● LIVE DETECTION</span>
                                </div>
                                <div style={{ aspectRatio: '16/9', background: '#000', position: 'relative' }}>
                                    <VideoFeed modules="face-detection" />
                                </div>
                            </div>

                            {/* Analytics & Trends */}
                            <div className="glass-panel" style={{ padding: '1.5rem', height: '350px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '1.1rem' }}>Face Detection Trends</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorFace" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ background: '#13111C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                            itemStyle={{ color: '#a855f7' }}
                                        />
                                        <Area type="monotone" dataKey="detections" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorFace)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Intelligence Log */}
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
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Face Intelligence Triggered</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                    {d.camera_name || 'Front Entry'} • {d.timestamp?.split(' ')?.pop()?.substring(0, 8)}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: getSeverityColor(d.confidence), fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    {((d.confidence || 0.9) * 100).toFixed(0)}%
                                                </div>
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
