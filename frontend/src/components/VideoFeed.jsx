import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import camerasApi from '../api/cameras.api';

const VideoFeed = ({ modules }) => {
    return <VideoFeedContent modules={modules} />;
};

const VideoFeedContent = ({ modules, cameraId: propCameraId }) => {
    const { cameraId: paramCameraId } = useParams();
    const cameraId = propCameraId || paramCameraId;

    const [videoSrc, setVideoSrc] = useState('');
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const setupStream = async () => {
            setLoading(true);
            setError(false);

            let targetId = cameraId;

            // If no cameraId is strictly provided (e.g. Dashboard usage?), try to fetch first camera
            if (!targetId) {
                try {
                    const cameras = await camerasApi.getAll();
                    if (cameras && cameras.length > 0) {
                        targetId = cameras[0].id; // Default to first camera if on main dashboard
                    }
                } catch (e) {
                    console.error("Failed to fetch default camera", e);
                }
            }

            if (targetId && active) {
                // Construct the stream URL
                // Using the /video_feed endpoint which streams MJPEG
                const src = `${API_BASE_URL}/video_feed?camera_id=${targetId}&modules=${modules || ''}&t=${Date.now()}`;
                setVideoSrc(src);
            } else if (active) {
                // No camera found
                setError(true);
            }
            if (active) setLoading(false);
        };

        setupStream();

        return () => { active = false; };
    }, [cameraId, modules, retryCount]);

    const handleImgError = () => {
        console.warn("Video stream connection lost or failed.");
        setError(true);
        // Auto-retry after 3 seconds
        setTimeout(() => {
            setRetryCount(c => c + 1);
        }, 3000);
    };

    if (error) {
        return (
            <div style={{
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                background: '#000', color: '#fff'
            }}>
                <p>Stream Check Failed</p>
                <button
                    onClick={() => setRetryCount(c => c + 1)}
                    style={{
                        marginTop: '1rem', padding: '0.5rem 1rem',
                        background: 'var(--accent-cyan)', border: 'none',
                        borderRadius: '4px', cursor: 'pointer'
                    }}
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    if (loading || !videoSrc) {
        return (
            <div style={{
                width: '100%', height: '100%',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                background: '#000', color: '#666'
            }}>
                Wait...
            </div>
        );
    }

    return (
        <img
            src={videoSrc}
            alt="Live Video Stream"
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain', // Ensure aspect ratio is preserved
                display: 'block'
            }}
            onError={handleImgError}
        />
    );
};

export default VideoFeed;

