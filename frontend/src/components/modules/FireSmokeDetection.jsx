import React from 'react';
import ModulePage from './ModulePage';

const FireSmokeDetection = () => {
    return (
        <ModulePage title="Fire & Smoke Detection">
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Fire Safety Alerts</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No active fire or smoke alerts.
                    </div>
                </div>
            </div>
        </ModulePage>
    );
};

export default FireSmokeDetection;
