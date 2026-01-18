import React, { useState } from 'react';

const StorageSettings = () => {
    // Mock data for storage
    const [storageStats] = useState({
        total: 5000, // GB
        used: 3450, // GB
        pending: 1550, // GB
        recordings: 120, // Hours
        integrity: 'Healthy'
    });

    const usedPercentage = (storageStats.used / storageStats.total) * 100;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, fontWeight: '500' }}>Storage Management</h3>
                <div style={{ color: 'var(--success-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    ● {storageStats.integrity}
                </div>
            </div>

            {/* Storage Visualization */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{
                    position: 'relative', width: '120px', height: '120px', borderRadius: '50%',
                    background: `conic-gradient(var(--accent-cyan) ${usedPercentage}%, rgba(255,255,255,0.1) 0)`
                }}>
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-dark)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{Math.round(usedPercentage)}%</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Used</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Storage</span>
                        <span style={{ color: '#fff' }}>{storageStats.total / 1000} TB</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Used Space</span>
                        <span style={{ color: 'var(--accent-cyan)' }}>{(storageStats.used / 1000).toFixed(1)} TB</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Available</span>
                        <span style={{ color: '#fff' }}>{(storageStats.pending / 1000).toFixed(1)} TB</span>
                    </div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Storage Actions</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{
                        flex: 1, padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
                    }}>
                        Clear Old Footages
                    </button>
                    <button style={{
                        flex: 1, padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', color: '#fff',
                        border: '1px solid var(--panel-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
                    }}>
                        Check Integrity
                    </button>
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Est. Recording Time Remaining: <b>{Math.floor(storageStats.pending * 0.5)} Hours</b>
                </div>
            </div>
        </div>
    );
};

export default StorageSettings;
