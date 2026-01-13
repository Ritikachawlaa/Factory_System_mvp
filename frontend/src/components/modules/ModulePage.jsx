import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import VideoFeed from '../VideoFeed';
import StatsPanel from '../face_rec/StatsPanel';

const ModulePage = ({ title, children, rightPanelContent, videoModules }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div><Sidebar /></div>
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
                        <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '500', marginBottom: '-0.5rem' }}>{title}</h2>

                        {/* Video Feed */}
                        <div style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid var(--panel-border)',
                            background: '#000',
                            aspectRatio: '16/9',
                            position: 'relative'
                        }}>
                            <VideoFeed modules={videoModules} />
                            <div style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                background: '#ef4444', color: '#fff',
                                padding: '2px 8px', borderRadius: '4px',
                                fontSize: '0.75rem', fontWeight: 'bold'
                            }}>LIVE</div>
                        </div>

                        {/* Custom Content Area */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {children}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ minWidth: '300px' }}>
                        {rightPanelContent || <StatsPanel />}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ModulePage;
