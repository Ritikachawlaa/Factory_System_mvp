import React, { useEffect, useState } from 'react';
import httpClient from '../../api/httpClient';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const SecurityModuleAnalyticsDashboard = ({ cameraId, endpointPrefix, title, accentColor = '#22c55e', emptyText = 'No events today' }) => {
    const [stats, setStats] = useState({ total_events: 0, unique_tracks: 0, peak_hour: null, avg_confidence: 0 });
    const [trend, setTrend] = useState({ labels: [], today: [], yesterday: [] });
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [statsRes, trendRes, timelineRes] = await Promise.all([
                    httpClient.get(`/api/cameras/${cameraId}/${endpointPrefix}-stats`),
                    httpClient.get(`/api/cameras/${cameraId}/${endpointPrefix}-trend`),
                    httpClient.get(`/api/cameras/${cameraId}/${endpointPrefix}-timeline`)
                ]);

                setStats(statsRes || { total_events: 0, unique_tracks: 0, peak_hour: null, avg_confidence: 0 });
                setTrend(trendRes || { labels: [], today: [], yesterday: [] });
                setTimeline(timelineRes || []);
            } catch (err) {
                console.error(`Error fetching ${endpointPrefix} analytics:`, err);
            } finally {
                setLoading(false);
            }
        };

        if (cameraId) {
            fetchAnalytics();
            const interval = setInterval(fetchAnalytics, 30000);
            return () => clearInterval(interval);
        }
    }, [cameraId, endpointPrefix]);

    if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading {title} Analytics...</div>;

    const chartData = (trend?.labels || []).map((label, i) => ({
        time: label,
        Today: (trend?.today || [])[i] || 0,
        Yesterday: (trend?.yesterday || [])[i] || 0
    }));

    const formatTime = (dateStr) => {
        if (!dateStr) return '--:--:--';
        // Normalize SQL ' ' to ISO 'T' and ensure it ends with Z for UTC interpretation
        let normalized = typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr;
        if (typeof normalized === 'string' && !normalized.endsWith('Z')) {
            normalized += 'Z';
        }
        const date = new Date(normalized);
        if (isNaN(date.getTime())) return 'Invalid Time';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const peakHourFormatted = stats?.peak_hour !== null && stats?.peak_hour !== undefined
        ? `${stats.peak_hour.toString().padStart(2, '0')}:00`
        : '--:--';

    const avgConfidencePct = `${Math.round((stats?.avg_confidence || 0) * 100)}%`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <SummaryCard label="Total Events" value={stats.total_events} subtext="Today" color={accentColor} />
                <SummaryCard label="Unique IDs" value={stats.unique_tracks} subtext="Track IDs seen" color={accentColor} />
                <SummaryCard label="Peak Hour" value={peakHourFormatted} subtext="Highest activity" color={accentColor} />
                <SummaryCard label="Avg Confidence" value={avgConfidencePct} subtext="Detection quality" color={accentColor} />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', height: '400px' }}>
                <div className="glass-panel" style={{ flex: 2, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>{title} Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={`securityTrend-${endpointPrefix}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" fontSize={12} tickCount={8} />
                            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="Today" stroke={accentColor} fillOpacity={1} fill={`url(#securityTrend-${endpointPrefix})`} />
                            <Area type="monotone" dataKey="Yesterday" stroke="rgba(255,255,255,0.2)" fill="transparent" strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Activity Timeline</h3>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {Array.isArray(timeline) && timeline.length > 0 ? timeline.map((entry, idx) => (
                            <TimelineEntry key={idx} entry={entry} formatTime={formatTime} />
                        )) : (
                            <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '2rem' }}>{emptyText}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value, subtext, color }) => (
    <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: `4px solid ${color}` }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold' }}>{value}</div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{subtext}</div>
    </div>
);

const TimelineEntry = ({ entry, formatTime }) => (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{formatTime(entry.time)} - {entry.label}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{entry.confidence}</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '4px' }}>{entry.meta || 'Event recorded'}</div>
    </div>
);

export default SecurityModuleAnalyticsDashboard;
