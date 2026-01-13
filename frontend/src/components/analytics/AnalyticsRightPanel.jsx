import React from 'react';
import StatsPanel from '../face_rec/StatsPanel'; // Reusing StatsPanel for Detected Stats/Performance

const AnalyticsRightPanel = () => {
    return (
        <aside style={{
            width: '320px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            borderLeft: '1px solid var(--panel-border)',
            background: 'rgba(5, 11, 20, 0.2)'
        }}>

            {/* System Uptime & Stability */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    letterSpacing: '1px'
                }}>System Uptime & Stability</h3>

                {/* Mock Line Chart */}
                <div style={{ height: '60px', position: 'relative', borderBottom: '1px solid #334155', marginBottom: '0.5rem' }}>
                    <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <polyline
                            points="0,40 50,30 100,50 150,20 200,20 250,10"
                            fill="none"
                            stroke="var(--success-color)"
                            strokeWidth="2"
                        />
                        {[0, 50, 100, 150, 200, 250].map((x, i) => {
                            const y = [40, 30, 50, 20, 20, 10][i];
                            return <circle key={i} cx={x} cy={y} r="3" fill="var(--bg-dark)" stroke="var(--success-color)" strokeWidth="2" />
                        })}
                    </svg>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>99.5%</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Uptime</span>
                </div>
            </div>

            {/* Reusing existing panels for consistency */}
            <StatsPanel />

        </aside>
    );
};

export default AnalyticsRightPanel;
