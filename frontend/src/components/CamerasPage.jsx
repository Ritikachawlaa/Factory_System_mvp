import React from 'react';
import Header from './Header';
import Footer from './Footer';
import VideoFeed from './VideoFeed';

const CamerasPage = () => {
    const [cameras, setCameras] = React.useState([]);

    React.useEffect(() => {
        const fetchCameras = async () => {
            try {
                const response = await fetch('http://localhost:8000/cameras');
                if (response.ok) {
                    const data = await response.json();
                    // Map backend data to UI format if needed, or just use as is
                    // Backend returns {id, name, source}
                    // We need status/type mock for UI if not in DB
                    setCameras(data.map(c => ({
                        ...c,
                        location: c.name,
                        type: 'Network Cam',
                        status: 'Online'
                    })));
                }
            } catch (e) { console.error(e); }
        };
        fetchCameras();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />

            <main style={{
                flex: 1,
                padding: '2rem',
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '1.5rem',
                alignContent: 'start'
            }}>
                {cameras.map((cam, index) => (
                    <div key={cam.id} className="glass-panel" style={{
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        minHeight: '300px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{cam.location}</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cam.id} • {cam.type}</span>
                            </div>
                            <div style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: cam.status === 'Online' || cam.status === 'Recording' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: cam.status === 'Online' || cam.status === 'Recording' ? 'var(--success-color)' : '#ef4444',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>
                                {cam.status}
                            </div>
                        </div>

                        {/* Video Feed Placeholder */}
                        <div style={{
                            flex: 1,
                            background: '#000',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            position: 'relative',
                            border: '1px solid #334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {/* Use VideoFeed for the first one as a demo, others as mock */}
                            {index === 0 ? (
                                <VideoFeed />
                            ) : (
                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Camera Feed Unavailable</div>
                            )}
                        </div>
                    </div>
                ))}
            </main>

            <Footer />
        </div>
    );
};

export default CamerasPage;
