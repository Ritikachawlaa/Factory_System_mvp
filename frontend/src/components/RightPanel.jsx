import React from 'react';

const RightPanel = () => {
    const alerts = [
        { id: 1, msg: 'CAM 1: Unattended Package detected', type: 'warning' },
        { id: 2, msg: 'CAM 2: Unauthorized access attempt', type: 'danger' },
        { id: 3, msg: 'Lost child report: Smoke detected', type: 'info' }
    ];

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
            <div>
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '1rem'
                }}>Alerts</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {alerts.map(alert => (
                        <div key={alert.id} style={{
                            padding: '1rem',
                            background: 'rgba(30, 41, 59, 0.5)',
                            borderRadius: '8px',
                            borderLeft: `3px solid ${alert.type === 'danger' ? 'var(--danger-color)' : alert.type === 'warning' ? 'var(--warning-color)' : 'var(--text-secondary)'}`,
                            fontSize: '0.85rem',
                            color: '#e2e8f0',
                            lineHeight: '1.4'
                        }}>
                            {alert.msg}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '1rem',
                    textAlign: 'left'
                }}>Data Usage</h3>

                <div style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    border: '10px solid #1e293b',
                    borderTop: '10px solid var(--accent-cyan)',
                    borderRight: '10px solid var(--accent-cyan)',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>75%</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full</div>
                </div>
            </div>
        </aside>
    );
};

export default RightPanel;
