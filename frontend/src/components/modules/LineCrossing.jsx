import React from 'react';
import ModulePage from './ModulePage';

const LineCrossing = () => {
    return (
        <ModulePage title="Line Crossing Detection">
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Crossing Events</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        <span style={{ color: '#ef4444' }}>Line A Crossed (Restricted)</span>
                        <span style={{ color: 'var(--text-secondary)' }}>10:45 AM</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--success-color)' }}>Line B Crossed (Exit)</span>
                        <span style={{ color: 'var(--text-secondary)' }}>11:00 AM</span>
                    </div>
                </div>
            </div>
        </ModulePage>
    );
};

export default LineCrossing;
