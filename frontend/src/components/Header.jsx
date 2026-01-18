import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            // AuthContext usually handles redirect, but we can force it just in case
            navigate('/login');
        }
        setProfileOpen(false);
    };

    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 2rem',
            borderBottom: '1px solid var(--panel-border)',
            background: 'rgba(5, 11, 20, 0.5)',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: 'var(--accent-cyan)',
                    letterSpacing: '1px'
                }}>
                    Vision <span style={{ color: '#fff' }}>AI</span>
                </div>
            </div>

            <nav style={{ display: 'flex', gap: '2rem' }}>
                {['Dashboard', 'Cameras', 'Analytics', 'Evidence', 'Attendance', 'Subscription', 'Settings'].map((item) => {
                    const path = item === 'Dashboard' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
                    // Special case for single word routes or direct mappings if needed, but 'evidence' works with default lowercasing.
                    const isActive = location.pathname === path || (item === 'Dashboard' && location.pathname === '/');

                    return (
                        <a key={item}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(path);
                            }}
                            href={path}
                            style={{
                                color: isActive ? '#fff' : 'var(--text-secondary)',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: isActive ? '600' : '400',
                                transition: 'color 0.2s',
                                cursor: 'pointer',
                                borderBottom: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                                paddingBottom: '4px'
                            }}>
                            {item}
                        </a>
                    );
                })}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                <div
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '1px solid var(--accent-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-cyan)',
                        cursor: 'pointer',
                        background: profileOpen ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                        transition: 'all 0.2s'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>

                {/* Dropdown Menu */}
                {profileOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '120%',
                        right: 0,
                        width: '220px',
                        background: '#0f172a', // Solid dark background
                        border: '1px solid rgba(6, 182, 212, 0.3)', // Cyan tint border
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.8), 0 4px 6px -2px rgba(0, 0, 0, 0.5)', // Stronger shadow
                        padding: '0.5rem',
                        zIndex: 9999, // Ensure it sits on top of everything
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                    }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem', textTransform: 'capitalize' }}>{user?.username || 'User'}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem', textTransform: 'capitalize' }}>
                                {user?.role === 'superadmin' ? 'Super Administrator' : 'Administrator'}
                            </div>
                        </div>

                        <button
                            onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                            style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '4px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e2e8f0'; }}
                        >
                            <span>⚙️</span> Settings
                        </button>

                        <button
                            onClick={handleLogout}
                            style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: '#ef4444', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '4px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <span>🚪</span> Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
