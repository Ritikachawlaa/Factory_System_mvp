import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import EventTrends from './EventTrends';
import ObjectTypes from './ObjectTypes';
import AnalyticsRightPanel from './AnalyticsRightPanel';

const AnalyticsPage = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div>
                    <Sidebar />
                </div>

                <div style={{
                    flex: 1,
                    display: 'flex',
                    background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)'
                }}>
                    {/* Center Content */}
                    <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '500', marginBottom: '0.5rem' }}>AI Camera Data Analytics & Reporting</h2>
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
