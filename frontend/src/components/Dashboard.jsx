import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import CameraGrid from './CameraGrid';

const Dashboard = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div>
                    <Sidebar />
                </div>

                <div style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                    background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)'
                }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '300',
                            color: '#fff',
                            marginBottom: '0.5rem',
                            letterSpacing: '0.5px'
                        }}>
                            AI Camera <span style={{ fontWeight: '600' }}>Dual System</span>
                        </h2>
                    </div>

                    <CameraGrid />

                </div>

                <RightPanel />
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
