import React, { useEffect, useState } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import VideoFeed from '../VideoFeed';
import StatsPanel from './StatsPanel';
import RecognizedList from './RecognizedList';
import camerasApi from '../../api/cameras.api';

const FaceRecognition = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [stats, setStats] = useState({ recognized_today: 0, unknowns: 0, accuracy: '99.2%', status: 'Active' });
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState(null);

    useEffect(() => {
        const fetchCams = async () => {
            try {
                const results = await camerasApi.getAll();
                setCameras(results);
                if (results.length > 0) {
                    setSelectedCameraId(results[0].id);
                }
            } catch (e) { console.error(e); }
        };
        fetchCams();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // In a real app, we'd fetch these from an API
    useEffect(() => {
        // Mocking some dynamic updates for the dashboard feel
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                recognized_today: prev.recognized_today + (Math.random() > 0.9 ? 1 : 0)
            }));
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <Sidebar />

                <div style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                    background: 'radial-gradient(circle at 50% 10%, rgba(30, 58, 138, 0.15) 0%, transparent 60%)'
                }}>
                    {/* Page Header */}
                    <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }} className="text-gradient">
                                Recognition Command Center
                            </h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="glass-panel" style={{ padding: '0.75rem 1.5rem' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Recognition Engine</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>● {stats.status}</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        {[
                            { label: "Recognized Today", value: stats.recognized_today, icon: '✅', color: 'var(--success-color)' },
                            { label: 'Unknown Persons', value: stats.unknowns, icon: '❓', color: '#ef4444' },
                            { label: 'Model Accuracy', value: stats.accuracy, icon: '🎯', color: 'var(--accent-cyan)' },
                            { label: 'Engine Health', value: 'Optimal', icon: '🔋', color: '#a855f7' }
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

                    {/* Main Layout Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

                        {/* Center Column: Feed & Recent Recognition */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Large Video Feed */}
                            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between' }}>
                                    <h3 style={{ margin: 0, color: '#fff' }}>Intelligence Stream</h3>
                                    <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.8rem' }}>● LIVE RECOGNITION</span>
                                </div>
                                <div style={{ aspectRatio: '16/9', background: '#000', position: 'relative' }}>
                                    {selectedCameraId && <VideoFeed modules="face-recognition" cameraId={selectedCameraId} />}
                                    {/* Overlay Info */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0, left: 0, right: 0,
                                        padding: '1rem',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'flex-end'
                                    }}>
                                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>Main Entrance Gate</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Latency: 42ms</div>
                                    </div>
                                </div>
                            </div>

                            {/* Horizontal Recognized List */}
                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Recently Identified
                                </h3>
                                <RecognizedList horizontal />
                            </div>
                        </div>

                        {/* Right Column: Detailed Stats & Logs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <StatsPanel />
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FaceRecognition;
