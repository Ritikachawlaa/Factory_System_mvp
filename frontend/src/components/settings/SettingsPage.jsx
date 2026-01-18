import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import { useAuth } from '../../context/AuthContext';

import UserManagement from './UserManagement';
import StorageSettings from './StorageSettings';
import AuditLogs from './AuditLogs';


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


                    </div>

                    {/* System Configuration & Diagnostics (Moved to Bottom) */}
                    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                        {/* System Info */}
                        <div style={{ display: 'flex', gap: '3rem' }}>
                            <div>
                                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>System Configuration</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
                                    <div style={{ color: '#e2e8f0' }}>Firmware: <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>v5.2.1</span></div>
                                    <div style={{ color: 'var(--text-secondary)' }}>Last Update: 2 days ago</div>
                                </div>
                            </div>

                            {/* Backup Info */}
                            <div>
                                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>Backup Status</h3>
                                <div style={{ fontSize: '0.9rem', color: '#fff', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>Complete</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>1.2TB / 5TB</span>
                                </div>
                                <div style={{ width: '150px', height: '4px', background: '#334155', borderRadius: '2px', marginTop: '0.5rem' }}>
                                    <div style={{ width: '24%', height: '100%', background: 'var(--accent-cyan)', borderRadius: '2px' }}></div>
                                </div>
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
