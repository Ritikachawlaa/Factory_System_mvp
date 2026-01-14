import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../../config';

const StatsPanel = () => {
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ chart_data: [] });
    const [perf, setPerf] = useState({ accuracy: '-', latency: '-' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [evtRes, statRes, perfRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/events`, { headers: { 'ngrok-skip-browser-warning': 'true' } }),
                    fetch(`${API_BASE_URL}/stats/face`, { headers: { 'ngrok-skip-browser-warning': 'true' } }),
                    fetch(`${API_BASE_URL}/performance`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
                ]);

                if (evtRes.ok) setEvents(await evtRes.json());
                if (statRes.ok) setStats(await statRes.json());
                if (perfRes.ok) setPerf(await perfRes.json());
            } catch (e) { console.error(e); }
        };
        const interval = setInterval(fetchData, 2000);
        fetchData();
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>

            {/* Events Log */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    letterSpacing: '1px'
                }}>Events Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                    {events.length === 0 ? (
                        <span style={{ color: 'var(--text-secondary)' }}>No recent events</span>
                    ) : (
                        events.map((e, i) => (
                            <div key={i} style={{ color: e.message.includes('Unknown') ? '#e2e8f0' : 'var(--text-secondary)' }}>
                                {e.message} <span style={{ fontSize: '0.7em', opacity: 0.7 }}>({e.time})</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detected Statistics Graph */}
            <div className="glass-panel" style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    letterSpacing: '1px'
                }}>Detected Statistics</h3>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', paddingBottom: '0.5rem' }}>
                    {stats.chart_data && stats.chart_data.map((h, i) => (
                        <div key={i} style={{
                            width: '100%',
                            height: `${h}%`,
                            background: i === 5 ? 'var(--accent-cyan)' : '#1e293b',
                            borderRadius: '4px 4px 0 0',
                            position: 'relative'
                        }}></div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <span>100</span><span>200</span><span>300</span>
                </div>
            </div>

            {/* Model Performance */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    letterSpacing: '1px'
                }}>Model Performance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Accuracy</span>
                        <span style={{ color: 'var(--success-color)' }}>{perf.accuracy}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Latency</span>
                        <span style={{ color: 'var(--success-color)' }}>{perf.latency}</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default StatsPanel;
