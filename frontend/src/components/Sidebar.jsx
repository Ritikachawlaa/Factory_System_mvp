import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const modules = [
        { name: 'Facial Recognition', icon: 'face', active: window.location.pathname === '/face-recognition' },
        { name: 'PPE Compliance', icon: 'ppe', active: window.location.pathname === '/ppe-compliance' },
        { name: 'Object Detection', icon: 'obj', active: window.location.pathname === '/object-detection' },
        { name: 'Motion Tracking', icon: 'motion', active: window.location.pathname === '/motion-tracking' },
        { name: 'License Plate Recognition', icon: 'lpr', active: window.location.pathname === '/lpr' },
    ];

    const statuses = [
        { name: 'Online', color: 'var(--success-color)' },
        { name: 'Recording', color: 'var(--success-color)' },
        { name: 'Cloud Sync', color: 'var(--success-color)' },
    ];

    return (
        <aside style={{
            width: '280px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            borderRight: '1px solid var(--panel-border)',
            background: 'rgba(5, 11, 20, 0.2)'
        }}>
            {/* Modules Section */}
            <div>
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '1rem'
                }}>Modules</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {modules.map((mod) => (
                        <div key={mod.name}
                            onClick={() => {
                                if (mod.name === 'Facial Recognition') window.location.href = '/face-recognition';
                                if (mod.name === 'Dashboard') window.location.href = '/';
                                if (mod.name === 'PPE Compliance') window.location.href = '/ppe-compliance';
                                if (mod.name === 'Object Detection') window.location.href = '/object-detection';
                                if (mod.name === 'Motion Tracking') window.location.href = '/motion-tracking';
                                if (mod.name === 'License Plate Recognition') window.location.href = '/lpr';
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: mod.active ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                                border: mod.active ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                                cursor: 'pointer',
                                color: mod.active ? '#fff' : 'var(--text-secondary)',
                                transition: 'all 0.2s'
                            }}>
                            <div style={{
                                width: '32px', height: '32px',
                                background: mod.active ? 'var(--accent-cyan)' : '#1e293b',
                                borderRadius: '6px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: mod.active ? '#000' : '#fff'
                            }}>
                                <span style={{ fontSize: '0.8rem' }}>AI</span>
                            </div>
                            <span style={{ fontSize: '0.9rem' }}>{mod.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Status and Logout */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <h3 style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '1rem'
                    }}>System Status</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {statuses.map(status => (
                            <div key={status.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <div style={{
                                    width: '8px', height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: status.color,
                                    boxShadow: `0 0 8px ${status.color}`
                                }}></div>
                                {status.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logout Button */}
                <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem' }}>
                    <div onClick={() => { logout(); navigate('/login'); }} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem', borderRadius: '8px',
                        color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)',
                        cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        <span>🚪</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Logout</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
