import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import EventTrends from './EventTrends';
import ObjectTypes from './ObjectTypes';
import AnalyticsRightPanel from './AnalyticsRightPanel';
import HumanAnalyticsDashboard from './HumanAnalyticsDashboard';
import axios from 'axios';
import API_BASE_URL from '../../config';

const AnalyticsPage = () => {
    const [cameras, setCameras] = React.useState([]);
    const [selectedCameraId, setSelectedCameraId] = React.useState(null);

    React.useEffect(() => {
        const fetchCameras = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/cameras`);
                setCameras(res.data);
                if (res.data.length > 0) setSelectedCameraId(res.data[0].id);
            } catch (err) {
                console.error("Error fetching cameras:", err);
            }
        };
        fetchCameras();
    }, []);

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
                            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '500' }}>AI Camera Data Analytics & Reporting</h2>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Camera:</label>
                                <select
                                    value={selectedCameraId || ''}
                                    onChange={(e) => setSelectedCameraId(e.target.value)}
                                    style={{ padding: '0.5rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
                                >
                                    {cameras.map(cam => (
                                        <option key={cam.id} value={cam.id}>{cam.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Human Analytics Section */}
                        <section>
                            <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Human Detection Insights</h3>
                            {selectedCameraId && <HumanAnalyticsDashboard cameraId={selectedCameraId} />}
                        </section>

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
        </div >
    );
};

export default AnalyticsPage;
