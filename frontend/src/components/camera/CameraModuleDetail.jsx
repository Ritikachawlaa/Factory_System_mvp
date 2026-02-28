import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import VideoFeed from '../VideoFeed';
import API_BASE_URL from '../../config';
import HumanDetectionTrend from './modules/HumanDetectionTrend';
import HumanAnalyticsDashboard from '../analytics/HumanAnalyticsDashboard';
import FaceAnalyticsDashboard from '../analytics/FaceAnalyticsDashboard';
import modulesApi from '../../api/modules.api';


// Import Panels (we will create these next)

import { getModuleConfig } from '../../config/moduleRegistry';
import { RealtimeService } from '../../services/realtimeService';
import { useAuth } from '../../context/AuthContext';
import { AuditLogService } from '../../services/auditLogService';
import camerasApi from '../../api/cameras.api'; // Import API

const CameraModuleDetail = () => {
    const { cameraId, moduleType } = useParams();
    const navigate = useNavigate();
    const [camera, setCamera] = useState(null);
    const [moduleStatus, setModuleStatus] = useState('active');
    const { user, checkPermission } = useAuth();

    // Permission Check
    const canControl = checkPermission('control_module');

    useEffect(() => {
        // Re-fetch camera to get name/details
        const fetchCam = async () => {
            try {
                const found = await camerasApi.getById(cameraId);
                if (found) {
                    setCamera(found);
                } else {
                    setCamera({ id: cameraId, name: `Camera ${cameraId}`, rtsp: 'webcam' });
                }
            } catch (e) { console.error(e); }
        };
        fetchCam();

        // Init status from service
        setModuleStatus(RealtimeService.getModuleStatus(cameraId, moduleType));

        // Listen for external changes (or self-updates reflected back)
        const handleEvent = (event) => {
            if (event.type === 'STATUS_CHANGE' && event.data.moduleKey === moduleType) {
                setModuleStatus(event.data.status);
            }
        };
        RealtimeService.subscribe(cameraId, handleEvent);

        return () => {
            RealtimeService.unsubscribe(cameraId, handleEvent);
        };
    }, [cameraId, moduleType]);

    const handleToggleActive = async () => {
        if (!canControl) {
            alert("You do not have permission to control modules.");
            return;
        }

        const currentIsActive = moduleStatus === 'active';
        const newIsActive = !currentIsActive;
        const newModuleStatusString = newIsActive ? 'active' : 'paused';

        setModuleStatus(newModuleStatusString); // Optimistic update

        try {
            await modulesApi.toggleModule(cameraId, moduleType, newIsActive);

            // Log Action
            AuditLogService.logAction(
                user.username,
                newIsActive ? 'MODULE_ENABLE' : 'MODULE_DISABLE',
                `${newIsActive ? 'Started' : 'Stopped'} ${config.label}`,
                { cameraId: cameraId, module: moduleType },
                'Medium'
            );
        } catch (e) {
            console.error("Failed to toggle module", e);
            setModuleStatus(currentIsActive ? 'active' : 'paused'); // Rollback
            alert("Failed to update module status");
        }
    };



    // Determine which panel to render
    const config = getModuleConfig(moduleType);
    const renderPanel = () => {
        if (config && config.panelComponent) {
            const PanelComponent = config.panelComponent;
            return <PanelComponent cameraId={cameraId} />;
        }
        return <div style={{ color: '#fff', padding: '2rem' }}>Panel for {config ? config.label : moduleType} under construction.</div>;
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

    if (!camera) return null;
    if (!config) return <div style={{ color: '#fff', padding: '2rem' }}>Module not found</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{
                    flex: 1,
                    padding: '1.5rem',
                    overflowY: 'auto',
                    background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 350px',
                    gap: '1.5rem'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Breadcrumb Header & CONTROLS */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/cameras')}>Cameras</span>
                                <span>/</span>
                                <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/cameras/${cameraId}`)}>{camera.name}</span>
                                <span>/</span>
                                <span style={{ color: '#fff', fontWeight: 'bold' }}>{config.label}</span>
                            </div>

                            {/* UI ONLY CONTROLS */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Last Sync: Just now</span>
                                <button
                                    onClick={handleToggleActive}
                                    disabled={!canControl}
                                    title={!canControl ? "Restricted Access" : "Toggle Status"}
                                    style={{
                                        background: moduleStatus === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: moduleStatus === 'active' ? '#10b981' : '#ef4444',
                                        border: '1px solid currentColor',
                                        padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: canControl ? 'pointer' : 'not-allowed',
                                        opacity: canControl ? 1 : 0.5,
                                        fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase'
                                    }}>
                                    {moduleStatus === 'active' ? '● ACTIVE' : '⏸ PAUSED'}
                                </button>
                                <button style={{ background: 'var(--accent-cyan)', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                                    ↻
                                </button>
                            </div>
                        </div>

                        {/* Video Feed (Module Specific) */}
                        <div id="camera-feed-container" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)', background: '#000', aspectRatio: '16/9', position: 'relative' }}>
                            {/* Pass specific module key to video feed for overlays */}
                            <VideoFeed modules={moduleType} />
                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                {camera.name} • {config.label}
                            </div>
                            <button onClick={toggleFullscreen} style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>
                                ⤢ Fullscreen
                            </button>
                        </div>

                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h3 style={{ color: '#fff' }}>Analytics & Trends</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Historical data for {config.label} on this camera.</p>
                            {moduleType === 'human-detection' ? (
                                <HumanAnalyticsDashboard cameraId={cameraId} />
                            ) : moduleType === 'face-detection' ? (
                                <FaceAnalyticsDashboard cameraId={cameraId} />
                            ) : (
                                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--panel-border)', borderRadius: '8px', marginTop: '1rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Chart Placeholder - {config.label} Trends</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel (The Module Panel Component) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                        {renderPanel()}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CameraModuleDetail;
