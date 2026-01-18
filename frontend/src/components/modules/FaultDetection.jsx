import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';

const FaultDetection = () => {
    const [events, setEvents] = useState([]);
    const [detectionRate, setDetectionRate] = useState(0);
    const [efficiencyData, setEfficiencyData] = useState([]);

    useEffect(() => {
        // Mock data
        setEvents([
            { id: 1, type: 'Crack Detected', description: 'Machine A - Surface fissure', severity: 'Critical', timestamp: '2024-05-20 10:30:00', operator: 'John Doe' },
            { id: 2, type: 'Misalignment', description: 'Conveyor Belt 2 - Sensor drift', severity: 'Warning', timestamp: '2024-05-20 11:15:00', operator: 'Jane Smith' },
            { id: 3, type: 'Overheating', description: 'Motor Unit 4 - Temp exceeds limit', severity: 'Critical', timestamp: '2024-05-20 11:30:00', operator: 'Mike Ross' },
            { id: 4, type: 'Vibration', description: 'Chassis B - Abnormal frequency', severity: 'Warning', timestamp: '2024-05-20 12:00:00', operator: 'Unknown' },
        ]);
        setDetectionRate(98.5);
        setEfficiencyData([80, 85, 90, 88, 92, 95, 98]); // Last 7 days
    }, []);

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Maintenance Schedule</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>Machine A</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Next Check: Tomorrow</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>Conveyor Belt 2</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Next Check: 3 Days</div>
                    </div>
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>System Status</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success-color)' }}></div>
                    <span style={{ color: '#fff', fontSize: '0.9rem' }}>Sensors Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success-color)' }}></div>
                    <span style={{ color: '#fff', fontSize: '0.9rem' }}>AI Model Running</span>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Fault Detection" videoModules="fault_detection" rightPanelContent={<RightPanelContent />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Active Faults log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {events.length === 0 ? (
                            <div style={{ color: 'var(--text-secondary)' }}>No recent faults detected.</div>
                        ) : (
                            events.map((e) => (
                                <div key={e.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
                                    borderLeft: `3px solid ${e.severity === 'Critical' ? '#ef4444' : '#eab308'}`
                                }}>
                                    <div>
                                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>{e.type}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{e.description}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontSize: '0.75rem', fontWeight: 'bold',
                                            color: e.severity === 'Critical' ? '#ef4444' : '#eab308',
                                            padding: '2px 6px', background: e.severity === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                            borderRadius: '4px', marginBottom: '4px', display: 'inline-block'
                                        }}>{e.severity}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{e.timestamp.split(' ')[1]}</div>
                                        <div style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem', marginTop: '2px' }}>Op: {e.operator}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Efficiency Trend (7 Days)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', paddingTop: '1rem' }}>
                        {efficiencyData.map((val, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                                <div style={{
                                    width: '60%',
                                    height: `${val}%`,
                                    background: `linear-gradient(to top, var(--accent-cyan), #60a5fa)`,
                                    borderRadius: '4px 4px 0 0',
                                    opacity: 0.8,
                                    transition: 'height 0.5s'
                                }}></div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Day {idx + 1}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '1rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1rem' }}>
                        <div style={{ fontSize: '2.5rem', color: 'var(--success-color)', fontWeight: 'bold' }}>{detectionRate}%</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Average Efficiency Score</div>
                    </div>
                </div>
            </div>
        </ModulePage>
    );
};

export default FaultDetection;
