import React, { useState, useEffect } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import FaceAnalyticsDashboard from '../analytics/FaceAnalyticsDashboard';
import camerasApi from '../../api/cameras.api';

const FaceAnalyticsPage = () => {
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchCams = async () => {
            try {
                const results = await camerasApi.getAll();
                setCameras(results);
                if (results.length > 0) {
                    setSelectedCameraId(results[0].id);
                }
            } catch (e) {
                console.error("Error fetching cameras:", e);
            }
        };
        fetchCams();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
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
                    background: 'radial-gradient(circle at 50% 10%, rgba(168, 85, 247, 0.1) 0%, transparent 60%)'
                }}>
                    {/* Page Header */}
                    <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }} className="text-gradient">
                                Face Intelligence Analytics
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '600px' }}>
                                Comprehensive behavioral analysis and recognition trends across your facility's optical sensors.
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>SELECT SOURCE</div>
                                <select
                                    value={selectedCameraId || ''}
                                    onChange={(e) => setSelectedCameraId(Number(e.target.value))}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--panel-border)',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        padding: '0.6rem 1rem',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        minWidth: '200px'
                                    }}
                                >
                                    {cameras.map(cam => (
                                        <option key={cam.id} value={cam.id}>{cam.name || `Camera ${cam.id}`}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Dashboard */}
                    {selectedCameraId ? (
                        <FaceAnalyticsDashboard cameraId={selectedCameraId} />
                    ) : (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '5rem' }}>
                            Please select a camera to view analytics.
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FaceAnalyticsPage;
