import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const modules = [
        { name: 'Face Recognition', icon: 'face', path: '/face-recognition' },
        { name: 'Vehicle/ANPR', icon: 'lpr', path: '/lpr' },
        { name: 'Animal Detection', icon: 'animal', path: '/animal-detection' },
        { name: 'Object Detection/Abandoned', icon: 'obj', path: '/object-detection' },
        { name: 'Intrusion Detection', icon: 'intrusion', path: '/intrusion-detection' },
        { name: 'Loitering Detection', icon: 'loiter', path: '/loitering-detection' },
        { name: 'People Count', icon: 'people', path: '/people-count' },
        { name: 'Line Crossing', icon: 'line', path: '/line-crossing' },
        { name: 'Box Production', icon: 'box', path: '/box-production' },
        { name: 'Fault Detection', icon: 'fault', path: '/fault-detection' },
        { name: 'Helmet/PPE', icon: 'ppe', path: '/ppe-compliance' },
        { name: 'Fire/Smoke', icon: 'fire', path: '/fire-smoke' },
        { name: 'Entry/Exit', icon: 'entry', path: '/entry-exit' },
        { name: 'Aggressive Behaviour/Fight', icon: 'fight', path: '/fight-detection' },
        { name: 'Camera Tampering', icon: 'cam', path: '/camera-tampering' },

    ];

    const statuses = [
        { name: 'Online', color: 'var(--success-color)' },
        { name: 'Recording', color: 'var(--success-color)' },
        { name: 'Cloud Sync', color: 'var(--success-color)' },
    ];

    return (
        <aside style={{
            width: '280px',
            height: '100%',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            borderRight: '1px solid var(--panel-border)',
            background: 'rgba(5, 11, 20, 0.2)'
        }}>
            {/* Modules Section */}
            <div className="always-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: '0.5rem', marginRight: '-0.5rem' }}>
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
                            onClick={() => window.location.href = mod.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: window.location.pathname === mod.path ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                                border: window.location.pathname === mod.path ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                                cursor: 'pointer',
                                color: window.location.pathname === mod.path ? '#fff' : 'var(--text-secondary)',
                                transition: 'all 0.2s'
                            }}>
                            <div style={{
                                width: '32px', height: '32px',
                                background: window.location.pathname === mod.path ? 'var(--accent-cyan)' : '#1e293b',
                                borderRadius: '6px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: window.location.pathname === mod.path ? '#000' : '#fff'
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
