import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';

const AnimalDetection = () => {
    const [sightings, setSightings] = useState([]);

    useEffect(() => {
        setSightings([
            { id: 1, type: 'Dog', count: 1, location: 'North Field', time: '08:30 AM', staff: 'None' },
            { id: 2, type: 'Bird Flock', count: 15, location: 'Runway Area', time: '09:15 AM', staff: 'Ranger: T. Stark' },
        ]);
    }, []);

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Deterrent Systems</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#fff', fontSize: '0.9rem' }}>Ultrasonic Repeller</span>
                    <span style={{ color: 'var(--success-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>ACTIVE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#fff', fontSize: '0.9rem' }}>Laser Deterrent</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>STANDBY</span>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Wildlife Monitoring & Detection" videoModules="animal_detection" rightPanelContent={<RightPanelContent />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Recent Sightings Log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {sightings.map((s) => (
                            <div key={s.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'
                            }}>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: '500' }}>{s.type}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{s.location}</div>
                                    {s.staff !== 'None' && <div style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', marginTop: '2px' }}>Staff: {s.staff}</div>}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{s.count}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{s.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Species Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff' }}>
                                <span>Birds</span> <span>75%</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '0.25rem' }}>
                                <div style={{ width: '75%', height: '100%', background: '#a855f7', borderRadius: '3px' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff' }}>
                                <span>Canines/Felines</span> <span>15%</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '0.25rem' }}>
                                <div style={{ width: '15%', height: '100%', background: '#f59e0b', borderRadius: '3px' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff' }}>
                                <span>Others</span> <span>10%</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '0.25rem' }}>
                                <div style={{ width: '10%', height: '100%', background: '#fff', borderRadius: '3px', opacity: 0.3 }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ModulePage>
    );
};

export default AnimalDetection;
