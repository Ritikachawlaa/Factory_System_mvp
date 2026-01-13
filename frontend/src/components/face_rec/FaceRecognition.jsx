import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import VideoFeed from '../VideoFeed';
import RecognizedList from './RecognizedList';
import Filters from './Filters';
import StatsPanel from './StatsPanel';

const FaceRecognition = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div>
                    <Sidebar />
                </div>

                <div style={{
                    flex: 1,
                    padding: '1.5rem',
                    overflowY: 'auto',
                    background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 300px',
                    gap: '1.5rem'
                }}>

                    {/* Center Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Large Video Feed */}
                        <div style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid var(--panel-border)',
                            background: '#000',
                            aspectRatio: '16/9',
                            position: 'relative'
                        }}>
                            <VideoFeed modules="face" />

                            {/* Overlay Info */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0, left: 0, right: 0,
                                padding: '1rem',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'flex-end'
                            }}>
                                <div style={{ color: '#fff', fontWeight: 'bold' }}>CAM 4: Home Hub</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>1080x800</div>
                            </div>
                            <div style={{
                                position: 'absolute',
                                top: '1rem', right: '1rem',
                                background: '#ef4444', color: '#fff',
                                padding: '2px 8px', borderRadius: '4px',
                                fontSize: '0.75rem', fontWeight: 'bold'
                            }}>LIVE</div>
                        </div>

                        {/* Bottom Section: Recognized Individuals */}
                        <div style={{ flex: 1 }}>
                            <RecognizedList />
                        </div>
                    </div>

                    {/* Right Column: Stats & Logs */}
                    <div style={{ minWidth: '300px' }}>
                        <StatsPanel />
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FaceRecognition;
