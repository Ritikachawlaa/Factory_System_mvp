import React from 'react';

const Toggle = ({ label, checked }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{label}</span>
        <div style={{
            width: '40px', height: '20px',
            background: checked ? 'var(--accent-cyan)' : '#334155',
            borderRadius: '20px',
            position: 'relative',
            cursor: 'pointer'
        }}>
            <div style={{
                width: '16px', height: '16px',
                background: '#fff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: checked ? '22px' : '2px',
                transition: 'left 0.2s'
            }}></div>
        </div>
    </div>
);

const GeneralPreferences = () => {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{
                color: '#fff', fontSize: '1rem',
                marginBottom: '1.5rem', fontWeight: '500'
            }}>General Preferences</h3>

            <Toggle label="Dark Mode" checked={true} />
            <Toggle label="Email Notifications" checked={true} />
            <Toggle label="Push Notifications" checked={false} />
            <Toggle label="Auto-Save Events" checked={true} />
        </div>
    );
};

export default GeneralPreferences;
