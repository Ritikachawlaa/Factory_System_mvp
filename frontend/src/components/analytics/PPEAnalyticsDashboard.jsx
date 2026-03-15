
import React, { useState, useEffect } from 'react';
import httpClient from '../../api/httpClient';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, Cell
} from 'recharts';

const PPEAnalyticsDashboard = ({ cameraId }) => {
    const [stats, setStats] = useState({
        total_violations: 0,
        type_counts: {},
        top_violation_type: 'None',
        avg_resolution_time: '-',
        safety_score: 100
    });
    const [trend, setTrend] = useState({ labels: [], today: [], yesterday: [] });
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [statsRes, trendRes, timelineRes] = await Promise.all([
                    httpClient.get(`/api/cameras/${cameraId}/ppe-stats`),
                    httpClient.get(`/api/cameras/${cameraId}/ppe-trend`),
                    httpClient.get(`/api/cameras/${cameraId}/ppe-timeline`)
                ]);
                setStats(statsRes || {
                    total_violations: 0,
                    type_counts: {},
                    top_violation_type: 'None',
                    avg_resolution_time: '-',
                    safety_score: 100
                });
                setTrend(trendRes || { labels: [], today: [], yesterday: [] });
                setTimeline(timelineRes || []);
            } catch (err) {
                console.error("Error fetching PPE analytics:", err);
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

    if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading PPE Analytics...</div>;

    const formatTime = (dateStr) => {
        if (!dateStr) return '--:--:--';
        try {
            // Force UTC interpretation by adding Z if missing
            let normalized = typeof dateStr === 'string' ? dateStr : String(dateStr);
            normalized = normalized.replace(' ', 'T');
            if (!normalized.includes('Z') && !normalized.includes('+')) {
                normalized += 'Z';
            }

            const date = new Date(normalized);
            if (isNaN(date.getTime())) return 'Invalid Time';

            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        } catch (e) {
            return 'Invalid Time';
        }
    };

    // Prepare chart data
    const chartData = (trend?.labels || []).map((label, i) => ({
        time: label,
        Today: (trend?.today || [])[i] || 0,
        Yesterday: (trend?.yesterday || [])[i] || 0
    }));

    const filteredTimeline = filter === 'All'
        ? timeline
        : timeline.filter(item => {
            const searchStr = `${item.label} ${item.message}`.toLowerCase();
            return searchStr.includes(filter.toLowerCase());
        });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <SummaryCard label="Total Violations" value={stats.total_violations} subtext="Today" icon="🦺" color="#ef4444" />
                <SummaryCard label="Safety Score" value={`${stats.safety_score}%`} subtext="Compliance" icon="🛡️" color="#10b981" />
                <SummaryCard label="Top Violation" value={stats.top_violation_type} subtext="Critical Type" icon="⚠️" color="#f59e0b" />
                <SummaryCard label="Avg Resolution" value={stats.avg_resolution_time} subtext="Response" icon="⏱️" color="#3b82f6" />
            </div>

            {/* Filter Section */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {['All', 'Helmet', 'Vest', 'Gloves', 'Shoes'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            background: filter === f ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                            color: filter === f ? '#000' : '#fff',
                            border: 'none',
                            padding: '0.4rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', height: '400px' }}>
                {/* Trend Chart */}
                <div className="glass-panel" style={{ flex: 2, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Violation Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
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
                            <Area type="monotone" dataKey="Today" stroke="#ef4444" fillOpacity={1} fill="url(#colorToday)" />
                            <Area type="monotone" dataKey="Yesterday" stroke="rgba(255,255,255,0.2)" fill="transparent" strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Violation Timeline */}
                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Violation Timeline</h3>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {Array.isArray(filteredTimeline) && filteredTimeline.length > 0 ? filteredTimeline.map((entry, idx) => (
                            <TimelineEntry key={idx} entry={entry} formatTime={formatTime} />
                        )) : (
                            <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '2rem' }}>No violations found</div>
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

const TimelineEntry = ({ entry, formatTime }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
            >
                <div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{formatTime(entry.time)} - {entry.label}</div>
                    <div style={{ color: entry.severity === 'high' ? '#ef4444' : '#f59e0b', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                        {entry.severity}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{entry.confidence}</div>
                    <div style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>{isOpen ? '▲ Hide' : '▼ Details'}</div>
                </div>
            </div>
            {isOpen && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                    {entry.message && (
                        <div style={{ color: '#fff', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                            {entry.message}
                        </div>
                    )}

                    {entry.boxes && entry.boxes.length > 0 ? (
                        <>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginBottom: '0.4rem' }}>
                                Bounding Boxes:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {entry.boxes.map((box, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '2px 6px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '3px',
                                        fontSize: '0.65rem',
                                        color: 'rgba(255,255,255,0.6)'
                                    }}>
                                        {box.label || 'Obj'}: [{box.x}, {box.y}, {box.w}, {box.h}]
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        !entry.message && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>No details available.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PPEAnalyticsDashboard;
