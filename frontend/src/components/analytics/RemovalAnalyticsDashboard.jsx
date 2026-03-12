
import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

const RemovalAnalyticsDashboard = ({ cameraId }) => {
    const [stats, setStats] = useState({
        total_removals: 0,
        suspicious_removals: 0,
        authorized_removals: 0,
        system_trust: '100%'
    });
    const [trend, setTrend] = useState({ labels: [], data: [] });
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [statsRes, trendRes, timelineRes] = await Promise.all([
                    httpClient.get(`/api/cameras/${cameraId}/removal-stats`),
                    httpClient.get(`/api/cameras/${cameraId}/removal-trend`),
                    httpClient.get(`/api/cameras/${cameraId}/removal-timeline`)
                ]);
                setStats(statsRes || { total_removals: 0, suspicious_removals: 0, authorized_removals: 0, system_trust: '100%' });
                setTrend(trendRes || { labels: [], data: [] });
                setTimeline(timelineRes || []);
            } catch (err) {
                console.error("Error fetching Removal analytics:", err);
            } finally {
                setLoading(false);
            }
        };

        if (cameraId) {
            fetchAnalytics();
        }
    }, [cameraId]);

    if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading Removal Analytics...</div>;

    const chartData = (trend?.labels || []).map((label, i) => ({
        type: label,
        Count: (trend?.data || [])[i] || 0
    }));

    const pieData = [
        { name: 'Authorized', value: stats.authorized_removals, color: '#10b981' },
        { name: 'Suspicious', value: stats.suspicious_removals, color: '#ef4444' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <SummaryCard label="Total Removed" value={stats.total_removals} subtext="Last 24h" icon="📦" color="var(--accent-cyan)" />
                <SummaryCard label="Suspicious" value={stats.suspicious_removals} subtext="Security Check" icon="🚨" color="#ef4444" />
                <SummaryCard label="Authorized" value={stats.authorized_removals} subtext="Logged" icon="✅" color="#10b981" />
                <SummaryCard label="System Trust" value={stats.system_trust} subtext="Accuracy" icon="💎" color="#3b82f6" />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', height: '350px' }}>
                <div className="glass-panel" style={{ flex: 2, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Removals by Object Category</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <YAxis dataKey="type" type="category" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                            <Bar dataKey="Count" fill="var(--accent-cyan)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem', alignSelf: 'flex-start' }}>Removal Types</h3>
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
                            <Legend verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Removal Events Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {timeline.slice(0, 5).map((t, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: '#fff' }}>{new Date(t.time).toLocaleTimeString()} - {t.label} removed</span>
                            <span style={{ color: t.label.includes('Critical') ? '#ef4444' : 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                Confidence: {t.confidence}
                            </span>
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

export default RemovalAnalyticsDashboard;
