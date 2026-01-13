import React from 'react';

const SettingsRightPanel = () => {
    return (
        <aside style={{
            width: '300px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            borderLeft: '1px solid var(--panel-border)',
            background: 'rgba(5, 11, 20, 0.2)'
        }}>

            {/* Search */}
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search settings..."
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '8px',
                        color: '#fff',
                        boxSizing: 'border-box' // Important fix for width overflow
                    }}
                />
                <span style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: 'var(--text-secondary)' }}>🔍</span>
            </div>

            {/* System Config */}
            <div>
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    letterSpacing: '1px'
                }}>System Configuration</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Firmware Version</span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>v5.2.1</span>
                    </div>
                    <div style={{ color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Last Update</span>
                        <span style={{ color: 'var(--text-secondary)' }}>2 days ago</span>
                    </div>
                </div>
            </div>

            {/* System Diagnostic */}
            <div>
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    letterSpacing: '1px'
                }}>Last Backup</h3>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#fff' }}>
                        <span>Backup Status</span>
                        <span style={{ color: 'var(--success-color)' }}>Complete</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>1.2TB / 5TB</div>
                    <div style={{ width: '100%', height: '4px', background: '#334155', borderRadius: '2px', marginTop: '0.5rem' }}>
                        <div style={{ width: '24%', height: '100%', background: 'var(--accent-cyan)', borderRadius: '2px' }}></div>
                    </div>
                </div>

                <button style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'var(--accent-cyan-dim)',
                    border: '1px solid var(--accent-cyan)',
                    color: 'var(--accent-cyan)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                }}>Run Diagnostic</button>
            </div>

        </aside>
    );
};

export default SettingsRightPanel;
