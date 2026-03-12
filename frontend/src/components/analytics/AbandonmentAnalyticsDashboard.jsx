
import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const AbandonmentAnalyticsDashboard = ({ cameraId }) => {
    const [stats, setStats] = useState({
        total_incidents: 0,
        avg_duration: '-',
        active_alerts: 0,
        security_risk: 'None'
    });
    const [trend, setTrend] = useState({ labels: [], data: [] });
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [statsRes, trendRes, timelineRes] = await Promise.all([
                    httpClient.get(`/api/cameras/${cameraId}/abandonment-stats`),
                    httpClient.get(`/api/cameras/${cameraId}/abandonment-trend`),
                    httpClient.get(`/api/cameras/${cameraId}/abandonment-timeline`)
                ]);
                setStats(statsRes || { total_incidents: 0, avg_duration: '-', active_alerts: 0, security_risk: 'None' });
                setTrend(trendRes || { labels: [], data: [] });
                setTimeline(timelineRes || []);
            } catch (err) {
                console.error("Error fetching Abandonment analytics:", err);
            } finally {
                setLoading(false);
            }
        };

        if (cameraId) {
            fetchAnalytics();
        }
    }, [cameraId]);

    if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading Abandonment Analytics...</div>;

    const chartData = (trend?.labels || []).map((label, i) => ({
        day: label,
        Incidents: (trend?.data || [])[i] || 0
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <SummaryCard label="Total Abandoned" value={stats.total_incidents} subtext="Today" icon="📦" color="#ef4444" />
                <SummaryCard label="Avg Duration" value={stats.avg_duration} subtext="Time to Alert" icon="⏱️" color="#3b82f6" />
                <SummaryCard label="Active Alerts" value={stats.active_alerts} subtext="Requires Action" icon="🔔" color="#f59e0b" />
                <SummaryCard label="Security Risk" value={stats.security_risk} subtext="Current Status" icon="🛡️" color="#10b981" />
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', height: '300px' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Weekly Incident Frequency</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="Incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Suspicious Objects Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {timeline.slice(0, 5).map((t, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: '#fff' }}>{new Date(t.time).toLocaleTimeString()} - {t.label} (Area: {t.location || 'Entrance'})</span>
                            <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>{t.severity || 'Urgent'}</span>
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

export default AbandonmentAnalyticsDashboard;
