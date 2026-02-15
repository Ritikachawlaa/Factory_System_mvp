import React from 'react'; // Force Rebuild
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: '⚡', path: '/' },
        { name: 'Cameras', icon: '📹', path: '/cameras' },
        { name: 'Analytics', icon: '📊', path: '/analytics' },
        { name: 'Evidence', icon: '📁', path: '/evidence' },
        { name: 'Audit Logs', icon: '📋', path: '/audit-logs' },
        { name: 'Settings', icon: '⚙️', path: '/settings' }
    ];

    const statuses = [
        { name: 'Online', color: '#10b981' },
        { name: 'Recording', color: '#ef4444' },
        { name: 'Cloud Sync', color: '#3b82f6' },
    ];

    return (
        <aside style={{
            width: '260px',
            height: '100%',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)',
            backdropFilter: 'blur(12px)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.2)'
        }}>
            {/* Branding / Logo Area (Optional if Header is present, but good for separation) */}
            {/* <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-cyan)', letterSpacing: '1px', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                Vision <span style={{ color: '#fff' }}>AI</span>
            </div> */}

            {/* Main Navigation */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    marginBottom: '0.75rem',
                    opacity: 0.8
                }}>Main Menu</h3>

                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <div key={item.name}
                            onClick={() => navigate(item.path)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                background: isActive ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.15), transparent)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                                cursor: 'pointer',
                                color: isActive ? '#fff' : 'var(--text-secondary)',
                                transition: 'all 0.2s ease-in-out',
                                fontWeight: isActive ? '600' : '400'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = '#fff';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontSize: '1.1rem', filter: isActive ? 'drop-shadow(0 0 8px var(--accent-cyan))' : 'none' }}>{item.icon}</span>
                            <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
                        </div>
                    );
                })}
            </div>
            {/* System Status & Logout */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h3 style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '0.25rem',
                        opacity: 0.7
                    }}>System Health</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {statuses.map(status => (
                            <div key={status.name} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem',
                                background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.6rem',
                                borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{
                                    width: '6px', height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: status.color,
                                    boxShadow: `0 0 6px ${status.color}`
                                }}></div>
                                {status.name}
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => { logout(); navigate('/login'); }} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem', borderRadius: '8px',
                    color: '#f87171', background: 'rgba(239, 68, 68, 0.1)',
                    cursor: 'pointer', transition: 'all 0.2s',
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                    width: '100%', justifyContent: 'center',
                    marginTop: '0.5rem'
                }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#f87171'; }}
                >
                    <span style={{ fontSize: '1rem' }}>🚪</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Logout System</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
