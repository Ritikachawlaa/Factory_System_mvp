import React from 'react';
import VideoFeed from './VideoFeed';

const CameraSlot = ({ title, status, isLive, subtitle }) => (
    <div style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--panel-border)',
        background: '#000',
        aspectRatio: '16/9',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <div style={{ flex: 1, position: 'relative' }}>
            {isLive ? (
                <VideoFeed />
            ) : (
                <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(45deg, #1e293b 25%, #0f172a 25%, #0f172a 50%, #1e293b 50%, #1e293b 75%, #0f172a 75%, #0f172a 100%)',
                    backgroundSize: '20px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)'
                }}>
                    <span style={{ fontSize: '0.9rem' }}>Offline</span>
                </div>
            )}

            {/* Overlays */}
            <div style={{
                position: 'absolute',
                top: '0.75rem', right: '0.75rem',
                background: status === 'LIVE' ? '#ef4444' : '#64748b',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
                {status}
            </div>
        </div>

        <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(5, 11, 20, 0.8)',
            borderTop: '1px solid var(--panel-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <span style={{ fontWeight: '500', fontSize: '0.9rem', color: '#e2e8f0' }}>{title}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{subtitle}</span>
        </div>
    </div>
);

const CameraGrid = () => {
    // Only the first camera is hooked up to the actual backend stream for now
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            padding: '0'
        }}>
            <CameraSlot
                title="CAM 1: Main Street"
                status="LIVE"
                isLive={true}
                subtitle="1920x1080"
            />
            <CameraSlot
                title="CAM 2: Warehouse Alpha"
                status="LIVE"
                isLive={false}
                subtitle="1920x1080"
            />
            <CameraSlot
                title="CAM 3: Urban Park"
                status="LIVE"
                isLive={false}
                subtitle="1920x1080"
            />
            <CameraSlot
                title="CAM 4: Home Hub"
                status="LIVE"
                isLive={false}
                subtitle="1280x720"
            />
        </div>
    );
};

export default CameraGrid;
