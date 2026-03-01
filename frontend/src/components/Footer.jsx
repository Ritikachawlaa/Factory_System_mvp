import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            padding: '1.5rem 0.5rem',
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid var(--panel-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.5rem'
        }}>
            <div style={{ maxWidth: '60%', width: '100%', margin: '0 auto' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '1rem', margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                        CAMAI – Intelligent Vision. Smarter Security.
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                        AI-Powered Real-Time Surveillance & Smart Monitoring Solutions.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0.5rem 0 0' }}>
                        Built for modern security and intelligent infrastructure.
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', color: 'var(--accent-cyan)', fontSize: '0.9rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <span>📧 support@camai.in</span>
                    <span>📍 India</span>
                </div>

                <div style={{ padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: '#475569', fontSize: '0.8rem' }}>© 2026 CAMAI. All Rights Reserved.</span>
                    <a href="#" style={{ color: '#475569', fontSize: '0.8rem', textDecoration: 'none' }}>Privacy Policy</a>
                    <a href="#" style={{ color: '#475569', fontSize: '0.8rem', textDecoration: 'none' }}>Terms & Conditions</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
