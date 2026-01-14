import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../../config';

const RecognizedList = () => {
    const [people, setPeople] = useState([]);
    const [tab, setTab] = useState('all'); // all, known, unknown

    useEffect(() => {
        const fetchDetections = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/detections?type=face&limit=50`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                if (response.ok) {
                    const data = await response.json();
                    setPeople(data);
                }
            } catch (error) {
                console.error("Error fetching faces:", error);
            }
        };

        const interval = setInterval(fetchDetections, 2000);
        fetchDetections();
        return () => clearInterval(interval);
    }, []);

    const filteredPeople = people.filter(p => {
        if (tab === 'known') return !p.label.startsWith('Visitor_');
        if (tab === 'unknown') return p.label.startsWith('Visitor_');
        return true;
    });

    return (
        <div className="glass-panel" style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    margin: 0
                }}>Recognized Individuals</h3>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', background: '#0f172a', padding: '2px', borderRadius: '4px' }}>
                    {['all', 'known', 'unknown'].map(t => (
                        <button key={t}
                            onClick={() => setTab(t)}
                            style={{
                                background: tab === t ? 'var(--accent-cyan)' : 'transparent',
                                color: tab === t ? '#000' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '2px',
                                padding: '2px 8px',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1 }}>
                {filteredPeople.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '1rem' }}>
                        No detections found.
                    </div>
                ) : (
                    filteredPeople.map((p, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            paddingBottom: '0.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {/* Avatar Placeholder */}
                                <div style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '6px',
                                    background: p.label.startsWith('Visitor_') ? '#475569' : '#059669', // Gray for unknown, Green for known
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: '0.8rem'
                                }}>
                                    {p.label.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                                        {p.label.startsWith('Visitor_') ? 'Unknown Face' : p.label}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.timestamp.split(' ')[1]}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                {p.confidence ? `${(p.confidence * 100).toFixed(1)}%` : '-'}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecognizedList;
