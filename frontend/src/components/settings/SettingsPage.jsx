import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import SettingsRightPanel from './SettingsRightPanel';
import UserManagement from './UserManagement';
import SecurityPanel from './SecurityPanel';
import CameraManagement from './CameraManagement';
import EmployeeManagement from './EmployeeManagement';

const SettingsPage = () => {
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
                    background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)',
                    display: 'flex', gap: '2rem'
                }}>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', alignContent: 'start' }}>
                        {/* Title */}
                        <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '500' }}>System Settings</h2>
                        </div>

                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <SecurityPanel />
                            <CameraManagement />
                        </div>

                        {/* Right Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <UserManagement />
                            <EmployeeManagement />
                        </div>
                    </div>

                    {/* Right UI Sidebar */}
                    <div style={{ width: '300px' }}>
                        <SettingsRightPanel />
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default SettingsPage;
