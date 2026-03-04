import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import EventTrends from './EventTrends';
import ObjectTypes from './ObjectTypes';
import AnalyticsRightPanel from './AnalyticsRightPanel';
import FaceAnalyticsDashboard from './FaceAnalyticsDashboard';

const AnalyticsPage = () => {
    const [selectedCameraId, setSelectedCameraId] = React.useState(1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    minHeight: 0,
                    background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)'
                }}>
                    {/* Center Content */}
                    <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '500', margin: 0 }}>AI Intelligence & Face Analytics</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Camera:</span>
                                <select
                                    value={selectedCameraId}
                                    onChange={(e) => setSelectedCameraId(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '4px', padding: '0.25rem' }}
                                >
                                    <option value="1">Camera 1</option>
                                    <option value="2">Camera 2</option>
                                </select>
                            </div>
                        </div>

                        {/* Face Recognition Section */}
                        <div style={{ marginBottom: '1rem' }}>
                            <FaceAnalyticsDashboard cameraId={selectedCameraId} />
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', height: '350px' }}>
                            <EventTrends />
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', height: '300px' }}>
                            <ObjectTypes />
                        </div>
                    </div>

                    {/* Right Panel */}
                    <AnalyticsRightPanel />
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default AnalyticsPage;
