import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Dashboard = () => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    // Mock Data for Dashboard
    const stats = {
        totalAlerts: 42,
        attendance: 94,
        activeCameras: 12,
        totalCameras: 14,
        systemStatus: 'Healthy'
    };

    const liveAlerts = [
        { id: 1, type: 'PPE Violation', location: 'Construction Site B', time: '10:45 AM', message: 'Worker detected without helmet', severity: 'high' },
        { id: 2, type: 'Intrusion', location: 'Perimeter Fence', time: '10:42 AM', message: 'Unauthorized entry detected', severity: 'high' },
        { id: 3, type: 'Face Recognition', location: 'Main Entrance', time: '10:40 AM', message: 'Identified: John Doe (Manager)', severity: 'low' },
        { id: 4, type: 'Fire', location: 'Warehouse A', time: '10:15 AM', message: 'Smoke detected in sector 4', severity: 'critical' },
        { id: 5, type: 'Vehicle', location: 'Loading Dock', time: '10:10 AM', message: 'License Plate: KL-07-AB-1234', severity: 'medium' },
    ];

    const lateArrivals = [
        { name: 'Alice Smith', time: '09:02 AM', dept: 'Marketing' },
        { name: 'Clara Oswald', time: '09:10 AM', dept: 'HR' },
    ];

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
                                Command Center
                            </h2>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', gap: '1rem' }}>
                            <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>System Uptime</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>24d : 12h : 45m</div>
                            </div>
                        </div>
                    </div>

                    {/* Top Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        {[
                            { label: "Today's Alerts", value: stats.totalAlerts, icon: '🚨', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '#ef4444' },
                            { label: 'Attendance', value: `${stats.attendance}%`, icon: '📋', bg: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', border: 'var(--accent-cyan)' },
                            { label: 'Active Cameras', value: `${stats.activeCameras}/${stats.totalCameras}`, icon: '📹', bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '#10b981' },
                            { label: 'System Health', value: stats.systemStatus, icon: '🛡️', bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '#3b82f6' }
                        ].map((item, idx) => (
                            <div key={idx} className="glass-panel" style={{
                                padding: '1.5rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                borderBottom: `2px solid ${item.border}`,
                                transition: 'transform 0.2s',
                                cursor: 'default'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
                                <button onClick={() => navigate('/evidence')} style={{
                                    padding: '0.5rem 1rem', background: 'transparent',
                                    border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)',
                                    borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}>
                                    View Logs
                                </button>
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
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>128</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Late Arrivals</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>4</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Recent Late Arrivals</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {lateArrivals.map((p, i) => (
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
                                    </div>
                                </div>
                            </div>

                            {/* Storage Widget */}
                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Storage Health</h3>
                                    <span style={{ color: '#f59e0b', fontSize: '0.9rem' }}>Warning</span>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#e2e8f0' }}>1.8 TB Used</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>2.0 TB Total</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                    Automatic archiving is enabled for footage older than 30 days.
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
