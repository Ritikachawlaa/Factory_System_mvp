import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';

const PeopleCount = () => {
    const [counts, setCounts] = useState([]);
    const [currentOccupancy, setCurrentOccupancy] = useState(0);
    const [recentIdentifications, setRecentIdentifications] = useState([]);

    useEffect(() => {
        setCounts([
            { time: '09:00', value: 12 },
            { time: '10:00', value: 25 },
            { time: '11:00', value: 45 },
            { time: '12:00', value: 30 },
            { time: '13:00', value: 55 },
        ]);
        setCurrentOccupancy(42);
        setRecentIdentifications([
            { id: 1, name: 'Alice Smith', time: '12:45 PM', type: 'Staff' },
            { id: 2, name: 'Bob Jones', time: '12:48 PM', type: 'Visitor' },
            { id: 3, name: 'Charlie Brown', time: '12:50 PM', type: 'Staff' }
        ]);
    }, []);

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Demographics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff' }}>
                            <span>Male</span> <span>60%</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '0.25rem' }}>
                            <div style={{ width: '60%', height: '100%', background: '#60a5fa', borderRadius: '3px' }}></div>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff' }}>
                            <span>Female</span> <span>40%</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '0.25rem' }}>
                            <div style={{ width: '40%', height: '100%', background: '#f472b6', borderRadius: '3px' }}></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Recent Identifications</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recentIdentifications.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ color: '#fff' }}>{p.name}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{p.time}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Peak Occupancy</h3>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginTop: '0.5rem' }}>1:00 PM</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>55 People</div>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Crowd Counting & Analysis" videoModules="people_count" rightPanelContent={<RightPanelContent />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Real-time Count</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#fff', lineHeight: '1' }}>{currentOccupancy}</div>
                            <div style={{ color: 'var(--accent-cyan)', fontSize: '1rem', marginTop: '0.5rem' }}>People Detected</div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Occupancy Trend (Today)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', paddingTop: '1rem' }}>
                        {counts.map((c, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                <div style={{
                                    width: '12px',
                                    height: `${(c.value / 60) * 100}%`,
                                    background: '#fff',
                                    borderRadius: '6px',
                                    opacity: 0.5
                                }}></div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ModulePage>
    );
};

export default PeopleCount;
