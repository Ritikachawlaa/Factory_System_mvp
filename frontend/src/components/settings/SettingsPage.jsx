import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import { useAuth } from '../../context/AuthContext';

import UserManagement from './UserManagement';
import StorageSettings from './StorageSettings';
import AuditLogs from './AuditLogs';
import CriticalAlertsSettings from './CriticalAlertsSettings';


const SettingsPage = () => {
    const { user } = useAuth();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>


                <div style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                    background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)',
                    display: 'flex', gap: '2rem', flexDirection: 'column'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', alignContent: 'start' }}>
                        {/* Title */}
                        <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '500' }}>System Settings</h2>
                        </div>

                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <StorageSettings />
                        </div>

                        {/* Right Column - User Management (Superadmin Only) */}
                        {user?.role === 'superadmin' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <UserManagement />
                            </div>
                        )}

                        {/* Audit Logs (Full Width) */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <AuditLogs />
                        </div>

                        {/* Critical Alerts Configuration (Full Width, Superadmin only) */}
                        {user?.role === 'superadmin' && (
                            <div style={{ gridColumn: '1 / -1' }}>
                                <CriticalAlertsSettings />
                            </div>
                        )}


                    </div>

                    {/* System Configuration & Diagnostics (Moved to Bottom) */}
                    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                        <div style={{ display: 'flex', gap: '3rem' }}>
                            {/* System Status Placeholder */}
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                System initialized and synchronized with cloud.
                            </div>
                        </div>

                        {/* Action */}
                        <button style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(6, 182, 212, 0.1)',
                            border: '1px solid var(--accent-cyan)',
                            color: 'var(--accent-cyan)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                        }}>Run Diagnostic</button>
                    </div>

                </div>

            </main >

            <Footer />
        </div >
    );
};

export default SettingsPage;
