
import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

const LabourAnalyticsDashboard = ({ cameraId }) => {
    const [stats, setStats] = useState({
        current_workers: 0,
        red_vests: 0,
        green_vests: 0,
        peak_count: 0,
        avg_shift_duration: '-'
    });
    const [trend, setTrend] = useState({ labels: [], today: [], yesterday: [] });
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [statsRes, trendRes, timelineRes] = await Promise.all([
                    httpClient.get(`/api/cameras/${cameraId}/labour-stats`),
                    httpClient.get(`/api/cameras/${cameraId}/labour-trend`),
                    httpClient.get(`/api/cameras/${cameraId}/labour-timeline`)
                ]);
                setStats(statsRes || {
                    current_workers: 0,
                    red_vests: 0,
                    green_vests: 0,
                    peak_count: 0,
                    avg_shift_duration: '-'
                });
                setTrend(trendRes || { labels: [], today: [], yesterday: [] });
                setTimeline(timelineRes || []);
            } catch (err) {
                console.error("Error fetching Labour analytics:", err);
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

    if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading Labour Analytics...</div>;

    const chartData = (trend?.labels || []).map((label, i) => ({
        time: label,
        Today: (trend?.today || [])[i] || 0,
        Yesterday: (trend?.yesterday || [])[i] || 0
    }));

    const pieData = [
        { name: 'Red Vest', value: stats.red_vests, color: '#ef4444' },
        { name: 'Green Vest', value: stats.green_vests, color: '#10b981' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <SummaryCard label="Current Workers" value={stats.current_workers} subtext="Live Count" icon="👥" color="var(--accent-cyan)" />
                <SummaryCard label="Red Vests" value={stats.red_vests} subtext="Authorized" icon="🦺" color="#ef4444" />
                <SummaryCard label="Green Vests" value={stats.green_vests} subtext="Visitors/Temp" icon="🦺" color="#10b981" />
                <SummaryCard label="Peak Today" value={stats.peak_count} subtext="At 12:45" icon="📈" color="#3b82f6" />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', height: '400px' }}>
                <div className="glass-panel" style={{ flex: 2, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Workforce Distribution (Today)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="Today" stroke="var(--accent-cyan)" fill="rgba(6, 182, 212, 0.2)" />
                            <Area type="monotone" dataKey="Yesterday" stroke="rgba(255,255,255,0.2)" fill="transparent" strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem', alignSelf: 'flex-start' }}>Vest Color Mix</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Activity Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {timeline.slice(0, 5).map((t, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: '#fff' }}>{new Date(t.time).toLocaleTimeString()} - {t.label}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Conf: {t.confidence}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value, subtext, icon, color }) => (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `4px solid ${color}` }}>
        <div style={{ fontSize: '1.5rem' }}>{icon}</div>
        <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold' }}>{value}</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{subtext}</div>
        </div>
    </div>
);

export default LabourAnalyticsDashboard;
