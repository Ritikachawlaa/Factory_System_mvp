import React, { useEffect, useState } from 'react';

const EventTrends = () => {
    const [data, setData] = useState({ labels: [], data: [] });

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const response = await fetch('http://localhost:8000/stats/trends');
                if (response.ok) {
                    setData(await response.json());
                }
            } catch (e) { console.error(e); }
        };
        fetchTrends();
    }, []);

    const maxVal = Math.max(...(data.data.length ? data.data : [100]));

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
            <h3 style={{
                color: '#fff', fontSize: '1rem',
                marginBottom: '1.5rem', fontWeight: '500'
            }}>Event Trends (Last 7 Days)</h3>

            <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '8px', paddingBottom: '20px', position: 'relative' }}>

                {/* Bars */}
                {data.labels.map((label, i) => {
                    const h = (data.data[i] / maxVal) * 100;
                    return (
                        <div key={i} style={{
                            flex: 1,
                            height: `${h}%`,
                            background: '#3b82f6',
                            borderRadius: '4px 4px 0 0',
                            position: 'relative',
                            opacity: 0.8,
                            maxWidth: '40px'
                        }}>
                            <div style={{
                                position: 'absolute', bottom: '-25px', left: 0, right: 0,
                                textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)'
                            }}>
                                {label}
                            </div>
                            <div style={{
                                position: 'absolute', top: '-20px', left: 0, right: 0,
                                textAlign: 'center', fontSize: '0.7rem', color: '#fff'
                            }}>
                                {data.data[i]}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EventTrends;
