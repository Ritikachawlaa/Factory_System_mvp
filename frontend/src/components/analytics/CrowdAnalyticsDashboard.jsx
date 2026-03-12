import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const CrowdAnalyticsDashboard = ({ cameraId }) => {
    const [stats, setStats] = useState({ max_people: 0, total_events: 0, peak_hour: null, avg_density: 0 });
    const [trend, setTrend] = useState({ labels: [], today: [], yesterday: [] });
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [statsRes, trendRes, timelineRes] = await Promise.all([
                    httpClient.get(`/api/cameras/${cameraId}/crowd-stats`),
                    httpClient.get(`/api/cameras/${cameraId}/crowd-trend`),
                    httpClient.get(`/api/cameras/${cameraId}/crowd-timeline`)
                ]);
                setStats(statsRes || { max_people: 0, total_events: 0, peak_hour: null, avg_density: 0 });
                setTrend(trendRes || { labels: [], today: [], yesterday: [] });
                setTimeline(timelineRes || []);
            } catch (err) {
                console.error("Error fetching crowd analytics:", err);
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

    if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading Crowd Analytics...</div>;

    // Prepare chart data
    const chartData = (trend?.labels || []).map((label, i) => ({
        time: label,
        Today: (trend?.today || [])[i] || 0,
        Yesterday: (trend?.yesterday || [])[i] || 0
    }));

    const peakHourFormatted = stats?.peak_hour !== null && stats?.peak_hour !== undefined
        ? `${stats.peak_hour.toString().padStart(2, '0')}:00`
        : '--:--';

    const handleThresholdChange = async (val) => {
        try {
            const modulesRes = await httpClient.get(`/api/cameras/${cameraId}/modules`);
            const module = modulesRes.find(m => m.key === 'crowd-density') || {};
            const currentConfig = typeof module.config === 'string' ? JSON.parse(module.config) : (module.config || {});

            await httpClient.patch(`/api/cameras/${cameraId}/modules/crowd-density`, {
                enabled: true,
                status: 'active',
                config: { ...currentConfig, threshold: parseInt(val, 10) }
            });
            // Update local ref or notification? 
        } catch (e) {
            console.error("Failed to update crowd threshold", e);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

            {/* Config & Summary Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>Crowd Threshold:</div>
                    <input
                        type="number"
                        defaultValue={5}
                        onChange={(e) => handleThresholdChange(e.target.value)}
                        style={{ width: '60px', padding: '0.4rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', textAlign: 'center' }}
                    />
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Alert when people count exceeds this value</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--success-color)' }}>● System Synchronized</div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <SummaryCard label="Max People" value={stats.max_people} subtext="Peak count today" icon="👥" color="#ef4444" />
                <SummaryCard label="Avg Density" value={`${(stats.avg_density * 100).toFixed(1)}%`} subtext="Floor space usage" icon="📊" color="#3b82f6" />
                <SummaryCard label="Peak Hour" value={peakHourFormatted} subtext="Most congested" icon="🔥" color="#f59e0b" />
                <SummaryCard label="Update Events" value={stats.total_events} subtext="Density logs" icon="🔔" color="#10b981" />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', height: '400px' }}>
                {/* Trend Chart */}
                <div className="glass-panel" style={{ flex: 2, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Time-based People Count Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorTodayCrowd" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" fontSize={12} tickCount={8} />
                            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="Today" stroke="#ef4444" fillOpacity={1} fill="url(#colorTodayCrowd)" />
                            <Area type="monotone" dataKey="Yesterday" stroke="rgba(255,255,255,0.2)" fill="transparent" strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Activity Timeline */}
                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Density Updates</h3>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {Array.isArray(timeline) && timeline.length > 0 ? timeline.map((entry, idx) => (
                            <TimelineEntry key={idx} entry={entry} />
                        )) : (
                            <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '2rem' }}>No crowd events today</div>
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
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{entry.time} - {entry.label}</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '4px' }}>{entry.meta || 'Density recorded'}</div>
    </div>
);

export default CrowdAnalyticsDashboard;
