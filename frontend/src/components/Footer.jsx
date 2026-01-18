import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 2rem',
            borderTop: '1px solid var(--panel-border)',
            background: 'rgba(5, 11, 20, 0.9)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>Fordnard Syatus</div>
                <div>Copyright binarydeep-16attreed Egids</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '2px' }}>
                    <span style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} onClick={() => window.location.href = '/privacy-policy'}>Privacy Policy</span>
                    &nbsp; • &nbsp;
                    <span style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} onClick={() => window.location.href = '/terms-of-service'}>Terms of Service</span>
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>
                    OCT 26, 2023 | 10:30 AM
                </div>
                <div style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>
                    Caps noitenid Disostionarray
                </div>
            </div>
        </footer>
    );
};

export default Footer;
