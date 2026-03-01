import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import analyticsApi from '../api/analytics.api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    const [stats, setStats] = useState({
        totalAlerts: 0,
        attendance: 100,
        activeCameras: 0,
        totalCameras: 0,
        systemStatus: 'Healthy'
    });

    const [lateArrivals, setLateArrivals] = useState([]);
    const [performance, setPerformance] = useState({ latency: '-', accuracy: '-', cpu: '-', mem: '-', gpu: '-' });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch aggregate stats
                const statsRes = await analyticsApi.getDashboardStats();
                if (statsRes) {
                    setStats(statsRes);
                }

                // Fetch recent events to populate intelligence feed
                const eventsRes = await analyticsApi.getEvents();
                if (eventsRes) {
                    const mappedEvents = eventsRes.slice(0, 5).map((e, index) => ({
                        id: index,
                        type: e.type === 'violation' ? 'Violation' : e.type === 'alert' ? 'Threat' : e.type || e.module_key || 'Event',
                        location: e.camera || 'System',
                        time: e.timestamp ? (typeof e.timestamp === 'string' && e.timestamp.includes(' ') ? e.timestamp.split(' ')[1] : String(e.timestamp)) : 'Just now',
                        message: e.label || 'Detection logged',
                        severity: e.severity || 'info'
                    }));
                    setLiveAlerts(mappedEvents);
                }
                // Fetch performance stats
                const perfRes = await analyticsApi.getPerformance();
                if (perfRes) {
                    setPerformance({
                        latency: perfRes.latency,
                        accuracy: perfRes.accuracy,
                        cpu: perfRes.cpu_usage,
                        mem: perfRes.memory_usage,
                        gpu: perfRes.gpu_usage
                    });
                }
            } catch (err) {
                console.error("Dashboard failed to fetch live data:", err);
            }
        };
        fetchData();
        const dataInterval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(dataInterval);
    }, []);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#ef4444';
            case 'high': return '#f59e0b';
            case 'medium': return '#3b82f6';
            default: return 'var(--success-color)';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                    background: 'radial-gradient(circle at 50% 10%, rgba(6, 182, 212, 0.15) 0%, transparent 60%)'
                }}>

                    {/* Welcoming Header */}
                    <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }} className="text-gradient">
                                Dashboard
                            </h2>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', gap: '1rem' }}>
                            <button onClick={() => navigate('/audit-logs')} className="glass-panel" style={{
                                padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--panel-border)', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>📋</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>AUDIT LOGS</span>
                            </button>
                        </div>
                    </div>

                    {/* Top Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        {[
                            { label: "Alerts", value: stats.totalAlerts, icon: '🚨', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '#ef4444', path: '/alerts' },
                            { label: 'Attendance', value: `${stats.attendance}%`, icon: '📋', bg: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', border: 'var(--accent-cyan)', path: '/attendance' },
                            { label: 'Active Cameras', value: `${stats.activeCameras}/${stats.totalCameras}`, icon: '📹', bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '#10b981', path: '/cameras' },
                            { label: 'Critical Alerts', value: stats.criticalAlerts || 0, icon: '🔥', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '#ef4444', path: '/alerts' }
                        ].map((item, idx) => (
                            <div key={idx} className="glass-panel"
                                onClick={() => item.path && navigate(item.path)}
                                style={{
                                    padding: '1.5rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    borderBottom: `2px solid ${item.border}`,
                                    transition: 'transform 0.2s',
                                    cursor: item.path ? 'pointer' : 'default'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    if (item.path) e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'transparent'; // Reset border if needed or keep original
                                    // Actually, border is set via styled component or inline. Let's be careful.
                                }}
                            >
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                                    <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#fff', marginTop: '0.5rem', lineHeight: 1 }}>{item.value}</div>
                                </div>
                                <div style={{
                                    fontSize: '2rem',
                                    background: item.bg,
                                    width: '60px', height: '60px',
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 0 20px ${item.bg}`
                                }}>
                                    {item.icon}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                        {/* LEFT COL: Live Feed */}
                        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                padding: '1.5rem',
                                borderBottom: '1px solid var(--panel-border)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: 'rgba(255,255,255,0.02)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }}></div>
                                    <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, fontWeight: '600' }}>Live Intelligence Feed</h3>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                                {liveAlerts.map(alert => (
                                    <div key={alert.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem',
                                        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
                                        borderRadius: '8px', borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
                                    }}>
                                        <div style={{
                                            padding: '0.75rem', borderRadius: '12px',
                                            background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--panel-border)'
                                        }}>
                                            {alert.type === 'Fire' ? '🔥' : alert.type === 'Vehicle' ? '🚗' : '⚠️'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                                                <span style={{ color: '#fff', fontWeight: '600', fontSize: '1rem' }}>{alert.type}</span>
                                                <span style={{
                                                    fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px',
                                                    background: `${getSeverityColor(alert.severity)}20`,
                                                    color: getSeverityColor(alert.severity),
                                                    border: `1px solid ${getSeverityColor(alert.severity)}40`
                                                }}>{alert.severity.toUpperCase()}</span>
                                            </div>
                                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                                {alert.message} <span style={{ color: '#475569' }}>|</span> <span style={{ color: 'var(--accent-cyan)' }}>{alert.location}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                            <div style={{ color: '#fff', fontWeight: 'bold' }}>{alert.time}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#475569' }}>Today</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT COL: Attendance & Modules */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* Attendance Widget */}
                            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Workforce Status</h3>
                                    <button onClick={() => navigate('/attendance')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.9rem' }}>View All &rarr;</button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                                    {/* Circular Progress Placeholder - CSS Conic Gradient */}
                                    <div style={{
                                        position: 'relative', width: '100px', height: '100px', borderRadius: '50%',
                                        background: `conic-gradient(var(--success-color) ${stats.attendance * 3.6}deg, #1e293b 0deg)`
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
                                            borderRadius: '50%', background: 'rgb(20, 25, 35)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                                        }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{stats.attendance}%</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Present</span>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Employees</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>{stats.totalEmployees || 0}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Late Arrivals</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.lateCount || 0}</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Recent Late Arrivals</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {(stats.lateArrivals || []).map((p, i) => (
                                            <div key={i} style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>{p.name.charAt(0)}</div>
                                                    <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{p.name}</span>
                                                </div>
                                                <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '500' }}>{p.time}</span>
                                            </div>
                                        ))}
                                        {(stats.lateArrivals?.length === 0) && (
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No late arrivals detected.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* System Health Widget */}
                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>System Health</h3>
                                    <span style={{ color: 'var(--success-color)', fontSize: '0.9rem', fontWeight: 'bold' }}>Optimal</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Accuracy</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{performance.accuracy}</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Latency</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{performance.latency}</div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Resource Allocation</span>
                                        <span style={{ color: '#fff' }}>60% GPU | {performance.cpu} CPU</span>
                                    </div>
                                    <div style={{ width: '100%', height: '4px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: '60%', height: '100%', background: 'var(--accent-cyan)', borderRadius: '2px' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;
