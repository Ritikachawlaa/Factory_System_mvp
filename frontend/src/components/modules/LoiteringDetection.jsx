import React from 'react';
import ModulePage from './ModulePage';

const LoiteringDetection = () => {
    return (
        <ModulePage title="Loitering Detection">
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Loitering Alerts</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        <span>Person loitering in Zone A</span>
                        <span style={{ color: 'var(--text-secondary)' }}>2m 30s</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        <span>Group gathering at Entrance</span>
                        <span style={{ color: 'var(--text-secondary)' }}>5m 10s</span>
                    </div>
                </div>
            </div>
        </ModulePage>
    );
};

export default LoiteringDetection;
