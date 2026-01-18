import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';

const EntryExitCount = () => {
    const [stats, setStats] = useState({ entered: 0, exited: 0 });
    const [recentLogs, setRecentLogs] = useState([]);

    useEffect(() => {
        setStats({ entered: 342, exited: 289 });
        setRecentLogs([
            { id: 1, type: 'Entry', name: 'David Lee', time: '10:05 AM' },
            { id: 2, type: 'Exit', name: 'Sarah Connor', time: '10:12 AM' },
            { id: 3, type: 'Entry', name: 'Kyle Reese', time: '10:15 AM' }
        ]);
    }, []);

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Net Flow</h3>
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>+{stats.entered - stats.exited}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Currently Inside</div>
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recentLogs.map(log => (
                        <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ color: log.type === 'Entry' ? 'var(--success-color)' : '#ef4444' }}>{log.type}</span>
                            <span style={{ color: '#fff' }}>{log.name}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{log.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Entry & Exit Management" videoModules="entry_exit" rightPanelContent={<RightPanelContent />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.1)',
                        color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem'
                    }}>
                        IN
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>{stats.entered}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Total Entries</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem'
                    }}>
                        OUT
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>{stats.exited}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Total Exits</div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Hourly Traffic Flow</h3>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {[8, 9, 10, 11, 12, 13, 14, 15, 16].map(hour => (
                        <div key={hour} style={{ minWidth: '60px', textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{hour}:00</div>
                            <div style={{ color: 'var(--success-color)', fontSize: '0.9rem', fontWeight: 'bold' }}>+{Math.floor(Math.random() * 30)}</div>
                            <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 'bold' }}>-{Math.floor(Math.random() * 25)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </ModulePage>
    );
};

export default EntryExitCount;
