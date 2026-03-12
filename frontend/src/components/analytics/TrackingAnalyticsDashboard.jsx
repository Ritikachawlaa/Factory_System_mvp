import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const TrackingAnalyticsDashboard = ({ cameraId }) => {
    const [stats, setStats] = useState({ total_tracks: 0, active_tracks: 0, total_events: 0, peak_hour: null });
    const [trend, setTrend] = useState({ labels: [], today: [], yesterday: [] });
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [statsRes, trendRes, timelineRes] = await Promise.all([
                    httpClient.get(`/api/cameras/${cameraId}/tracking-stats`),
                    httpClient.get(`/api/cameras/${cameraId}/tracking-trend`),
                    httpClient.get(`/api/cameras/${cameraId}/tracking-timeline`)
                ]);
                setStats(statsRes || { total_tracks: 0, active_tracks: 0, total_events: 0, peak_hour: null });
                setTrend(trendRes || { labels: [], today: [], yesterday: [] });
                setTimeline(timelineRes || []);
            } catch (err) {
                console.error("Error fetching tracking analytics:", err);
            } finally {
                setLoading(false);
            }
        };

        if (cameraId) {
            fetchAnalytics();
            const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30s
            return () => clearInterval(interval);
        }
    }, [cameraId]);

    if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading Tracking Analytics...</div>;

    // Prepare chart data
    const chartData = (trend?.labels || []).map((label, i) => ({
        time: label,
        Today: (trend?.today || [])[i] || 0,
        Yesterday: (trend?.yesterday || [])[i] || 0
    }));

    const peakHourFormatted = stats?.peak_hour !== null && stats?.peak_hour !== undefined
        ? `${stats.peak_hour.toString().padStart(2, '0')}:00`
        : '--:--';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <SummaryCard label="Total Tracks" value={stats.total_tracks} subtext="Unique IDs today" icon="🎯" color="#8b5cf6" />
                <SummaryCard label="Active Now" value={stats.active_tracks} subtext="Currently tracked" icon="📡" color="#10b981" />
                <SummaryCard label="Peak Hour" value={peakHourFormatted} subtext="Most new tracks" icon="🔥" color="#f59e0b" />
                <SummaryCard label="Lost Events" value={stats.total_events} subtext="Track transitions" icon="🔔" color="#ef4444" />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', height: '400px' }}>
                {/* Trend Chart */}
                <div className="glass-panel" style={{ flex: 2, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Time-based Object Flow Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorTodayTrack" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" fontSize={12} tickCount={8} />
                            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="Today" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTodayTrack)" />
                            <Area type="monotone" dataKey="Yesterday" stroke="rgba(255,255,255,0.2)" fill="transparent" strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Activity Timeline */}
                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Tracking Log</h3>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {Array.isArray(timeline) && timeline.length > 0 ? timeline.map((entry, idx) => (
                            <TimelineEntry key={idx} entry={entry} />
                        )) : (
                            <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '2rem' }}>No tracking events today</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value, subtext, icon, color }) => (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `4px solid ${color}` }}>
        <div style={{ fontSize: '1.5rem' }}>{icon}</div>
        <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold' }}>{value}</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{subtext}</div>
        </div>
    </div>
);

const TimelineEntry = ({ entry }) => (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{new Date(entry.time).toLocaleTimeString()} - {entry.label}</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '4px' }}>{entry.meta || 'Track recorded'}</div>
    </div>
);

export default TrackingAnalyticsDashboard;
