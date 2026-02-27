import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import analyticsApi from '../api/analytics.api';
import settingsApi from '../api/settings.api';

const TodayAlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [timeRange, setTimeRange] = useState('daily'); // daily, weekly, monthly
    const [criticalModules, setCriticalModules] = useState(['ppe-compliance', 'intrusion-detection']);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const daysMap = { daily: 1, weekly: 7, monthly: 30 };
            const data = await analyticsApi.getEvents(daysMap[timeRange]);
            setAlerts(data);

            // Fetch settings
            const settingsRes = await settingsApi.getSetting('critical_modules');
            if (settingsRes && settingsRes.value) {
                setCriticalModules(JSON.parse(settingsRes.value));
            }
        } catch (e) {
            console.error("Failed to fetch alerts or settings", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAlerts();
    }, [timeRange]);

    const filteredAlerts = alerts.filter(a =>
        a.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.camera.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const criticalAlerts = filteredAlerts.filter(a => criticalModules.includes(a.module_key));
    const regularAlerts = filteredAlerts.filter(a => !criticalModules.includes(a.module_key));

    const getSeverityStyle = (alert) => {
        if (criticalModules.includes(alert.module_key)) {
            return {
                border: '1px solid rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.05)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)'
            };
        }
        return {
            border: '1px solid var(--panel-border)',
            background: 'rgba(255, 255, 255, 0.02)'
        };
    };

    const getBadgeStyle = (severity) => {
        switch (severity) {
            case 'critical': return { background: '#ef4444', color: '#fff' };
            case 'high': return { background: '#f97316', color: '#fff' };
            case 'warning': return { background: '#f59e0b', color: '#000' };
            default: return { background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' };
        }
    };

    const renderAlertCard = (alert) => (
        <div
            key={alert.id}
            className="glass-panel"
            style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                transition: 'all 0.2s',
                ...getSeverityStyle(alert)
            }}
        >
            <div style={{ width: '100px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: 'bold', color: '#fff' }}>{alert.timestamp.split(' ')[1] || alert.timestamp}</div>
                <div style={{ fontSize: '0.7rem opacity: 0.7' }}>{alert.timestamp.split(' ')[0]}</div>
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{
                        fontSize: '0.65rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        ...getBadgeStyle(alert.severity)
                    }}>
                        {alert.severity || 'info'}
                    </span>
                    <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                        {alert.type.toUpperCase()}
                    </span>
                </div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: '500' }}>{alert.label}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Source: <span style={{ color: '#e2e8f0' }}>{alert.camera}</span>
                </div>
            </div>

            <div style={{ width: '120px', textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Confidence</div>
                <div style={{ fontSize: '1.2rem', color: alert.confidence > 0.8 ? 'var(--success-color)' : '#fff', fontWeight: 'bold' }}>
                    {(alert.confidence * 100).toFixed(0)}%
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{
                    padding: '2rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
                    overflow: 'hidden'
                }}>

                    {/* Page Header */}
                    <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }} className="text-gradient">Alerts</h2>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Centralized monitoring for threat detection and system violations.</p>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            {/* Time Filter Toggle */}
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '4px',
                                borderRadius: '8px',
                                border: '1px solid var(--panel-border)',
                                display: 'flex'
                            }}>
                                {['daily', 'weekly', 'monthly'].map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            border: 'none',
                                            background: timeRange === range ? 'var(--accent-cyan)' : 'transparent',
                                            color: timeRange === range ? '#000' : 'var(--text-secondary)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            textTransform: 'capitalize',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>

                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Search by label or source..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        paddingLeft: '2.5rem',
                                        background: 'rgba(30, 41, 59, 0.5)',
                                        border: '1px solid var(--panel-border)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        width: '280px',
                                        outline: 'none',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                            </div>
                        </div>
                    </div>

                    {/* Alerts Container */}
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }} className="always-scroll">
                        {loading ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <div className="loading-spinner" style={{ marginBottom: '1rem' }}>⌛</div>
                                <div>Querying analytics database...</div>
                            </div>
                        ) : filteredAlerts.length === 0 ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                                <h3>No alerts found</h3>
                                <p>Adjust your search or time range to see more results.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                                {/* Critical Section */}
                                {criticalAlerts.length > 0 && (
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <h3 style={{ color: '#ef4444', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Critical Violations</h3>
                                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.3) 0%, transparent 100%)' }}></div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {criticalAlerts.map(renderAlertCard)}
                                        </div>
                                    </section>
                                )}

                                {/* Regular Section */}
                                <section style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <h3 style={{ color: 'var(--accent-cyan)', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Activity Feed</h3>
                                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.3) 0%, transparent 100%)' }}></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {regularAlerts.length > 0 ? (
                                            regularAlerts.map(renderAlertCard)
                                        ) : (
                                            <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '1rem' }}>No standard activity logged for this period.</div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TodayAlertsPage;
