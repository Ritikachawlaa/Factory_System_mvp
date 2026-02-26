import React from 'react';

const HeatMapPanel = ({ cameraId }) => {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="glass-panel" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Heat Map Generator</h3>
                        <span style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                            ● Live Thermal Engine
                        </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                        The heatmap visually represents the accumulation of human traffic across the frame over time.
                        Warmer colors (red/orange) indicate high-traffic areas where personnel frequently walk or stand,
                        while cooler colors (blue) represent historically lower activity zones.
                    </div>
                </div>

                <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔥</div>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Thermal Tracking Active</h4>
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem', maxWidth: '80%' }}>
                        Please view the primary camera stream on the left to observe the live heatmap overlay mapped
                        in real-time against the facility floorplan.
                    </p>

                    <div style={{
                        marginTop: '2rem',
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(90deg, rgba(0,0,255,0.2) 0%, rgba(0,255,0,0.2) 50%, rgba(255,0,0,0.2) 100%)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem'
                    }}>
                        <span>Low Traffic</span>
                        <span>Medium Traffic</span>
                        <span>High Traffic</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeatMapPanel;
