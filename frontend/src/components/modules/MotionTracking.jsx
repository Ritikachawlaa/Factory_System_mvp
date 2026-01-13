import React from 'react';
import ModulePage from './ModulePage';

const MotionTracking = () => {
    return (
        <ModulePage title="Motion Tracking System">
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Activity Graph</h3>
                {/* Mock Graph */}
                <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '5px' }}>
                    {[10, 40, 20, 60, 30, 80, 20, 10, 5].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--accent-cyan)', opacity: 0.6 }}></div>
                    ))}
                </div>
            </div>
        </ModulePage>
    );
};

export default MotionTracking;
