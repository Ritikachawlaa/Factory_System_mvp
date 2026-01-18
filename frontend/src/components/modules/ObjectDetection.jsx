import React from 'react';
import ModulePage from './ModulePage';

const ObjectDetection = () => {
    return (
        <ModulePage title="Object Detection & Abandoned Objects">
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Detected Objects Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Person detected</span>
                        <span style={{ color: 'var(--text-secondary)' }}>00:01:23</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Car detected</span>
                        <span style={{ color: 'var(--text-secondary)' }}>00:01:20</span>
                    </div>
                </div>
            </div>
        </ModulePage>
    );
};

export default ObjectDetection;
