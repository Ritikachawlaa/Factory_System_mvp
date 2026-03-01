import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            padding: '1rem 2rem',
            background: 'rgba(5, 11, 20, 0.5)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid var(--panel-border)',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Left Side: Branding & AI Slogan */}
                <div style={{ flex: '1 1 auto', textAlign: 'left' }}>
                    <h4 style={{ color: '#fff', fontSize: '0.9rem', margin: '0 0 0.1rem 0', fontWeight: '600' }}>
                        CAMAI – Intelligent Vision. Smarter Security.
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>
                        AI-Powered Real-Time Surveillance & Smart Monitoring Solutions.
                    </p>
                </div>

                {/* Centre: Mission Statement */}
                <div style={{ flex: '1 1 auto', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>
                        Built for modern security and intelligent infrastructure.
                    </p>
                </div>

                {/* Right Side: Contact, Copyright & Links */}
                <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>
                        <span>📧 support@camai.in</span>
                        <span>📍 India</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#475569', fontSize: '0.7rem' }}>
                        <span>© 2026 CAMAI. All Rights Reserved.</span>
                        <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Terms & Conditions</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
