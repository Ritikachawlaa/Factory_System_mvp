import React from 'react';
import ModulePage from './ModulePage';

const LicensePlateRecognition = () => {
    return (
        <ModulePage title="Vehicle & ANPR">
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Scanned Plates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['ABC-1234', 'XYZ-9876', 'LMN-4567'].map(plate => (
                        <div key={plate} style={{
                            display: 'flex', justifyContent: 'space-between',
                            padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px'
                        }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#fff' }}>{plate}</span>
                            <span style={{ color: 'var(--success-color)', fontSize: '0.8rem' }}>Allowed</span>
                        </div>
                    ))}
                </div>
            </div>
        </ModulePage>
    );
};

export default LicensePlateRecognition;
