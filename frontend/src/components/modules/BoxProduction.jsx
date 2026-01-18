import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';

const BoxProduction = () => {
    const [hourlyData, setHourlyData] = useState([]);
    const [totalProduction, setTotalProduction] = useState(0);
    const [target] = useState(300);

    useEffect(() => {
        setHourlyData([
            { time: '08:00', count: 45, operator: 'Shift A - Team 1' },
            { time: '09:00', count: 52, operator: 'Shift A - Team 1' },
            { time: '10:00', count: 48, operator: 'Shift A - Team 2' },
            { time: '11:00', count: 60, operator: 'Shift A - Team 2' },
            { time: '12:00', count: 55, operator: 'Shift B - Team 1' },
        ]);
        setTotalProduction(260);
    }, []);

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Production Target</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#fff' }}>
                        <span>Progress</span>
                        <span>{Math.round((totalProduction / target) * 100)}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(totalProduction / target) * 100}%`, height: '100%', background: 'var(--accent-cyan)' }}></div>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                        Goal: {target} Units
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Box Production Analytics" videoModules="box_production" rightPanelContent={<RightPanelContent />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Hourly Output</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingTop: '1rem' }}>
                        {hourlyData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                <div style={{
                                    width: '40px',
                                    height: `${(d.count / 70) * 100}%`,
                                    background: 'var(--accent-cyan)',
                                    borderRadius: '4px 4px 0 0',
                                    opacity: 0.8
                                }}></div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.time}</span>
                                <span style={{ fontSize: '0.65rem', color: '#fff' }}>{d.operator.split(' - ')[1]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Efficiency Metrics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>52/hr</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg Rate</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>99.2%</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Accuracy</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>2</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rejected</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>4.5h</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Runtime</div>
                        </div>
                    </div>
                </div>
            </div>
        </ModulePage>
    );
};

export default BoxProduction;
