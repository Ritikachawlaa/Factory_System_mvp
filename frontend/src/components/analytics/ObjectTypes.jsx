import React from 'react';

const ObjectTypes = () => {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
                <h3 style={{
                    color: '#fff', fontSize: '1rem',
                    marginBottom: '1.5rem', fontWeight: '500'
                }}>Detected Object Types</h3>

                <div style={{
                    width: '180px', height: '180px',
                    borderRadius: '50%',
                    background: 'conic-gradient(var(--accent-cyan) 0% 40%, #1e293b 40% 55%, #3b82f6 55% 100%)',
                    margin: '0 auto',
                    position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        width: '120px', height: '120px',
                        borderRadius: '50%',
                        background: 'var(--panel-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column'
                    }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>1,280</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '500' }}>Filters</h3>
                {[
                    { label: 'Human', color: 'var(--accent-cyan)', val: '40%' },
                    { label: 'Vehicle', color: '#3b82f6', val: '45%' },
                    { label: 'Unknown', color: '#1e293b', val: '15%' }
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: item.color }}></div>
                        <div style={{ flex: 1 }}>{item.label}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>{item.val}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ObjectTypes;
