import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const FaceAnalyticsDashboard = ({ cameraId }) => {
    const [stats, setStats] = useState({ total_faces: 0, total_events: 0, peak_hour: null, avg_duration: 0 });
    const [trend, setTrend] = useState({ labels: [], today: [], yesterday: [] });
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [statsRes, trendRes, timelineRes] = await Promise.all([
                    httpClient.get(`/cameras/${cameraId}/face-stats`),
                    httpClient.get(`/cameras/${cameraId}/face-trend`),
                    httpClient.get(`/cameras/${cameraId}/face-timeline`)
                ]);
                setStats(statsRes || { total_faces: 0, total_events: 0, peak_hour: null, avg_duration: 0 });
                setTrend(trendRes || { labels: [], today: [], yesterday: [] });
                setTimeline(timelineRes || []);
            } catch (err) {
                console.error("Error fetching face analytics:", err);
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

    if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading Face Intelligence...</div>;

    // Prepare chart data
    const chartData = trend.labels.map((label, i) => ({
        time: label,
        Today: trend.today[i],
        Yesterday: trend.yesterday[i]
    }));

    const peakHourFormatted = stats.peak_hour !== null ? `${stats.peak_hour.toString().padStart(2, '0')}:00` : '--:--';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <SummaryCard label="Total Faces Detected" value={stats.total_faces} subtext="Today" icon="😊" color="#a855f7" />
                <SummaryCard label="Avg Duration" value={`${stats.avg_duration}s`} subtext="Per detection" icon="⏱️" color="#3b82f6" />
                <SummaryCard label="Peak Hour" value={peakHourFormatted} subtext="Highly active time" icon="🔥" color="#f59e0b" />
                <SummaryCard label="Events" value={stats.total_events} subtext="Detection logs" icon="📋" color="#10b981" />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', height: '400px' }}>
                {/* Trend Chart */}
                <div className="glass-panel" style={{ flex: 2, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Hourly Detection Comparison</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorFaceToday" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" fontSize={12} tickCount={8} />
                            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="Today" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorFaceToday)" />
                            <Area type="monotone" dataKey="Yesterday" stroke="rgba(255,255,255,0.2)" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Activity Timeline */}
                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Intelligence Log</h3>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {timeline.length > 0 ? timeline.map((entry, idx) => (
                            <TimelineEntry key={idx} entry={entry} />
                        )) : (
                            <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '2rem' }}>No face detection events recorded today.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value, subtext, icon, color }) => (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `4px solid ${color}` }}>
        <div style={{ fontSize: '1.5rem', opacity: 0.9 }}>{icon}</div>
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
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{entry.time} - {entry.label}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{entry.confidence}</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>Confidence Level</div>
    </div>
);

export default FaceAnalyticsDashboard;
