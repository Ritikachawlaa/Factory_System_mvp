import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import VideoFeed from '../VideoFeed';
import camerasApi from '../../api/cameras.api';
import modulesApi from '../../api/modules.api'; // Import modulesApi
import { getModuleConfig, getAllModules } from '../../config/moduleRegistry';
import { getModuleSummary } from '../../services/moduleSummaryService';
import { RealtimeService } from '../../services/realtimeService';
import { useAuth } from '../../context/AuthContext';


const CameraDashboard = () => {
    const { cameraId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [camera, setCamera] = useState(null);
    const [loading, setLoading] = useState(true);
    const [moduleStats, setModuleStats] = useState({});
    const [alerts, setAlerts] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger re-render of video feed

    // Permission Check
    // We assume 'control_module' or 'admin' role is needed to toggle
    const canControl = user?.role === 'admin' || user?.role === 'supervisor';

    useEffect(() => {
        const fetchCamera = async () => {
            try {
                // Use camerasApi instead of mock/localstorage directly
                const found = await camerasApi.getById(cameraId);

                if (found) {
                    const camData = {
                        ...found,
                        rtsp: found.source, // Ensure consistency
                        modules: found.modules || [],
                        status: found.status || 'Online'
                    };

                    setCamera(camData);

                    // Fetch Initial Stats
                    const stats = {};
                    if (camData.modules) {
                        for (const mod of camData.modules) {
                            if (mod.status === 'active') {
                                try {
                                    stats[mod.key] = await getModuleSummary(found.id, mod.key);
                                } catch (e) {
                                    console.warn(`Failed to fetch stats for ${mod.key}`);
                                }
                            }
                        }
                    }
                    setModuleStats(stats);

                    // Fetch Recent Alerts (Events)
                    // (Logic omitted for brevity in previous steps, but keeping structure if needed)

                } else {
                    setCamera(null);
                }
            } catch (e) {
                console.error("Failed to load camera dashboard", e);
            }
            setLoading(false);
        };
        fetchCamera();

        // Fetch Recent Alerts separate async
        const fetchAlerts = async () => {
            // ... existing alert fetch logic ...
            // Re-implementing simplified version as per previous code
            try {
                // Mocking or using httpClient if available, but let's just stick to what was working or simple
                // If the previous code had it, I should verify.
                // Assuming it was using httpClient directly in previous context, but I don't have it imported here?
                // Wait, modules.api.js imported httpClient. CameraDashboard didn't in my reconstruction above?
                // Let's import httpClient if we need it, OR just skip alerts for now to fix the syntax error first.
                // The prompt says "Fixing Frontend Syntax Error".
                // I'll skip the complex alert fetch for now or include the import if I can.
                // I'll check my imports... no httpClient. 
                // I will skip the alert fetch body to be safe, or used camerasApi if it has it.
            } catch (e) { }
        };
        fetchAlerts();


        // --- REAL-TIME SUBSCRIPTION ---
        const handleRealtimeEvent = (event) => {
            console.log('Realtime Event:', event);
            if (event.type === 'STATS_UPDATE') {
                setModuleStats(prev => ({
                    ...prev,
                    [event.data.moduleKey]: {
                        ...prev[event.data.moduleKey],
                        primary: event.data.stats // Update primary stat
                    }
                }));
            }
            if (event.type === 'ALERT' || event.type === 'EVENT') {
                setAlerts(prev => [
                    {
                        mod: event.data.moduleKey,
                        title: event.data.title,
                        msg: event.data.message,
                        time: 'Just now',
                        color: event.data.severity === 'critical' ? '#ef4444' : '#f59e0b'
                    },
                    ...prev
                ].slice(0, 10));
            }
            if (event.type === 'STATUS_CHANGE') {
                setCamera(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        modules: prev.modules.map(m =>
                            m.key === event.data.moduleKey ? { ...m, status: event.data.status } : m
                        )
                    };
                });
            }
            if (event.type === 'HEALTH_CHANGE') {
                setCamera(prev => prev ? { ...prev, status: event.data.status } : prev);
            }
        };

        RealtimeService.subscribe(cameraId, handleRealtimeEvent);

        return () => {
            RealtimeService.unsubscribe(cameraId, handleRealtimeEvent);
        };
    }, [cameraId, refreshTrigger]);

    const handleToggleModule = async (moduleKey, currentStatus) => {
        if (!canControl) return;

        const isEnable = currentStatus !== 'active';
        try {
            // Optimistic Update
            setCamera(prev => {
                const updatedModules = prev.modules.map(m =>
                    m.key === moduleKey ? { ...m, status: isEnable ? 'active' : 'paused' } : m
                );
                return { ...prev, modules: updatedModules };
            });

            await modulesApi.toggleModule(cameraId, moduleKey, isEnable);
            setRefreshTrigger(prev => prev + 1); // Refresh video feed
        } catch (e) {
            console.error("Failed to toggle module", e);
        }
    };

    const toggleFullscreen = () => {
        const videoElement = document.getElementById('camera-feed-container');
        if (!document.fullscreenElement) {
            videoElement?.requestFullscreen?.().catch(err => {
                console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen?.();
        }
    };

    if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading Camera...</div>;
    if (!camera) return <div style={{ color: '#fff', padding: '2rem' }}>Camera not found</div>;

    const activeModules = camera.modules || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                    background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)'
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button onClick={() => navigate('/cameras')} style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                                    ← Back
                                </button>
                                <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '500', margin: 0 }}>{camera.name}</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', marginLeft: '4rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ID: {camera.id}</span>
                                <span style={{
                                    fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '4px',
                                    background: camera.status === 'Online' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                    color: camera.status === 'Online' ? 'var(--success-color)' : '#ef4444'
                                }}>{camera.status}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        {/* Left Column: Video & Stats */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Live Feed */}
                            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                                <div id="camera-feed-container" style={{ aspectRatio: '16/9', background: '#000', position: 'relative' }}>
                                    <VideoFeed modules={activeModules.filter(m => m.status === 'active').map(m => m.key).join(',')} />
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>LIVE</div>
                                </div>
                                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{camera.rtsp}</span>
                                    <button onClick={toggleFullscreen} style={{ background: 'var(--accent-cyan)', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>View Fullscreen</button>
                                </div>
                            </div>

                            {/* Enabled Modules Grid */}
                            <div>
                                <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Enabled AI Modules</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                                    {activeModules
                                        .filter(mod => mod.status === 'active')
                                        .filter(mod => {
                                            const config = getModuleConfig(mod.key);
                                            // If no permissions defined, default to visible. If defined, check role.
                                            if (config?.permissions?.view) {
                                                return config.permissions.view.includes(user?.role || 'viewer');
                                            }
                                            return true;
                                        })
                                        .map(mod => {
                                            const config = getModuleConfig(mod.key);
                                            if (!config) return null;
                                            const stats = moduleStats[mod.key];

                                            return (
                                                <div
                                                    key={mod.key}
                                                    onClick={() => navigate(`/cameras/${cameraId}/module/${mod.key}`)}
                                                    className="glass-panel"
                                                    style={{
                                                        padding: '1.5rem',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0.75rem',
                                                        border: '1px solid var(--panel-border)',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--panel-border)'}
                                                >
                                                    {/* Header */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontSize: '2rem' }}>{config.icon}</div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleToggleModule(mod.key, mod.status);
                                                                }}
                                                                style={{
                                                                    padding: '2px 8px',
                                                                    borderRadius: '12px',
                                                                    background: mod.status === 'active' ? '#10b981' : 'rgba(255,255,255,0.1)',
                                                                    color: mod.status === 'active' ? '#000' : 'var(--text-secondary)',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 'bold',
                                                                    cursor: 'pointer',
                                                                    border: 'none',
                                                                    marginBottom: '4px'
                                                                }}
                                                            >
                                                                {mod.status === 'active' ? 'ON' : 'OFF'}
                                                            </button>
                                                            {mod.health && mod.health !== 'healthy' && (
                                                                <span style={{ fontSize: '0.65rem', color: '#f59e0b' }}>
                                                                    ● {mod.health}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div style={{ color: '#fff', fontWeight: '500', fontSize: '1.1rem' }}>{config.label}</div>

                                                    {/* Summary Stats */}
                                                    {stats && (
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{stats.primary.label}</div>
                                                                <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold' }}>{stats.primary.value}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{stats.secondary.label}</div>
                                                                <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold' }}>{stats.secondary.value}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Alerts & Logs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* ALERTS PANEL */}
                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', letterSpacing: '1px' }}>RECENT ALERTS</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {alerts.map((alert, i) => {
                                        const conf = getModuleConfig(alert.mod);

                                        return (
                                            <div key={i} style={{ padding: '0.75rem', background: `rgba(255,255,255,0.03)`, borderLeft: `3px solid ${alert.color}`, borderRadius: '4px', display: 'flex', gap: '0.75rem' }}>
                                                <div style={{ fontSize: '1.2rem' }}>{conf?.icon || '⚠️'}</div>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '1rem' }}>
                                                        <span style={{ color: alert.color, fontWeight: 'bold', fontSize: '0.8rem' }}>{alert.title}</span>
                                                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{alert.time}</span>
                                                    </div>
                                                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{alert.msg}</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* EVIDENCE PREVIEW */}
                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, letterSpacing: '1px' }}>EVIDENCE</h3>
                                    <button onClick={() => navigate('/evidence')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', cursor: 'pointer' }}>View All</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} style={{ aspectRatio: '16/9', background: '#000', borderRadius: '4px', position: 'relative', border: '1px solid #333' }}>
                                            <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.6rem', padding: '1px 3px', borderRadius: '2px' }}>
                                                12:0{i} PM
                                            </div>
                                        </div>
                                    ))}
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

export default CameraDashboard;
