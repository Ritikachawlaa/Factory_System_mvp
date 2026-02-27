import React, { useState, useEffect } from 'react';
import httpClient from '../../../api/httpClient';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const HumanDetectionTrend = ({ cameraId }) => {
    const [stats, setStats] = useState({ total_humans: 0, total_events: 0, peak_hour: null, avg_duration: 0 });
    const [trend, setTrend] = useState({ labels: [], today: [], yesterday: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [statsRes, trendRes] = await Promise.all([
                    httpClient.get(`/api/cameras/${cameraId}/human-stats`),
                    httpClient.get(`/api/cameras/${cameraId}/human-trend`)
                ]);
                setStats(statsRes);
                setTrend(trendRes);
            } catch (err) {
                console.error("Error fetching human analytics trend:", err);
            } finally {
                setLoading(false);
            }
        };

        if (cameraId) {
            fetchAnalytics();
            const interval = setInterval(fetchAnalytics, 30000);
            return () => clearInterval(interval);
        }
    }, [cameraId]);

    if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '1rem' }}>Loading Trends...</div>;

    const chartData = trend.labels.map((label, i) => ({
        time: label,
        Today: trend.today[i],
        Yesterday: trend.yesterday[i]
    }));

    const peakHourFormatted = stats.peak_hour !== null ? `${stats.peak_hour.toString().padStart(2, '0')}:00` : '--:--';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', marginTop: '1rem' }}>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <SummaryCard label="Total Detected" value={stats.total_humans} subtext="Today" icon="👥" color="#3b82f6" />
                <SummaryCard label="Avg Duration" value={`${stats.avg_duration}m`} subtext="Per detection" icon="⏳" color="#10b981" />
                <SummaryCard label="Peak Hour" value={peakHourFormatted} subtext="Highly peak time" icon="🔥" color="#f59e0b" />
                <SummaryCard label="Events" value={stats.total_events} subtext="Detection events" icon="🔔" color="#8b5cf6" />
            </div>

            {/* Trend Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', height: '300px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hourly Detection Comparison</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" fontSize={10} tickCount={8} />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
                        <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="Today" stroke="#3b82f6" fillOpacity={1} fill="url(#colorToday)" />
                        <Area type="monotone" dataKey="Yesterday" stroke="rgba(255,255,255,0.2)" fill="transparent" strokeDasharray="5 5" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value, subtext, icon, color }) => (
    <div style={{
        padding: '1rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--panel-border)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderLeft: `3px solid ${color}`
    }}>
        <div style={{ fontSize: '1.25rem' }}>{icon}</div>
        <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{value}</div>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>{subtext}</div>
        </div>
    </div>
);

export default HumanDetectionTrend;
