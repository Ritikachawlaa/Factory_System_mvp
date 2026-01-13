import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 2rem',
            borderBottom: '1px solid var(--panel-border)',
            background: 'rgba(5, 11, 20, 0.5)',
            backdropFilter: 'blur(8px)'
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
                {['Dashboard', 'Cameras', 'Analytics', 'Settings'].map((item) => {
                    const path = item === 'Dashboard' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-cyan)'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default Header;
