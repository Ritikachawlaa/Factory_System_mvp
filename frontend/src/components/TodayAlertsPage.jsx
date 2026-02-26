import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import analyticsApi from '../api/analytics.api';

const TodayAlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAlerts = async () => {
        try {
            const data = await analyticsApi.getTodayEvents();
            setAlerts(data);
        } catch (e) {
            console.error("Failed to fetch today's alerts", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const filteredAlerts = alerts.filter(a =>
        a.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.camera.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSeverityStyle = (severity) => {
        if (severity === 'critical' || severity === 'high') {
            return {
                border: '1px solid #ef4444',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.05)'
            };
        }
        if (severity === 'warning') {
            return {
                border: '1px solid #f59e0b',
                background: 'rgba(245, 158, 11, 0.02)'
            };
        }
        return {
            border: '1px solid var(--panel-border)',
            background: 'var(--panel-bg)'
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                <div style={{
                    padding: '2rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
                    overflow: 'hidden'
                }}>

                    {/* Page Header */}
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }} className="text-gradient">Today's Intelligence Feed</h2>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Real-time audit of all detections and violations generated today.</p>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search alerts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    paddingLeft: '2.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--panel-border)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    width: '300px',
                                    outline: 'none focus:border-var(--accent-cyan)'
                                }}
                            />
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        </div>
                    </div>

                    {/* Alerts Container */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }} className="always-scroll">
                        {loading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <div style={{ fontSize: '2rem' }}>⌛</div>
                                <div style={{ marginTop: '1rem' }}>Synchronizing with database...</div>
                            </div>
                        ) : filteredAlerts.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <div style={{ fontSize: '2rem' }}>🛡️</div>
                                <div style={{ marginTop: '1rem' }}>No alerts matched your criteria for today.</div>
                            </div>
                        ) : (
                            filteredAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="glass-panel"
                                    style={{
                                        padding: '1.25rem 1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2rem',
                                        transition: 'transform 0.2s',
                                        ...getSeverityStyle(alert.severity)
                                    }}
                                >
                                    <div style={{ width: '80px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{alert.timestamp.split(' ')[1]}</div>
                                        <div>{alert.timestamp.split(' ')[0]}</div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                ...getBadgeStyle(alert.severity)
                                            }}>
                                                {alert.severity || 'info'}
                                            </span>
                                            <span style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: '600' }}>
                                                {alert.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{alert.label}</h3>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            Camera: <span style={{ color: '#e2e8f0' }}>{alert.camera}</span>
                                        </div>
                                    </div>

                                    <div style={{ width: '150px', textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Confidence</div>
                                        <div style={{ fontSize: '1.1rem', color: alert.confidence > 0.8 ? 'var(--success-color)' : '#fff', fontWeight: 'bold' }}>
                                            {(alert.confidence * 100).toFixed(1)}%
                                        </div>
                                    </div>

                                    <button
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => window.alert(`Alert ID: ${alert.id}\nMetadata: ${alert.metadata || 'None'}`)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TodayAlertsPage;
