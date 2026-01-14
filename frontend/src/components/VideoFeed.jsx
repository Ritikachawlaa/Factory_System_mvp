import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../config';

const VideoFeed = ({ modules }) => {
    const [retryCount, setRetryCount] = useState(0);
    const [isError, setIsError] = useState(false);
    const [useClientCamera, setUseClientCamera] = useState(false);
    const [processedImage, setProcessedImage] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const wsRef = useRef(null);

    // --- Server Side Stream Logic ---
    const videoSrc = `${API_BASE_URL}/video_feed?modules=${modules || ''}&t=${Date.now()}_${retryCount}`;

    const handleError = () => {
        setIsError(true);
        setTimeout(() => {
            setIsError(false);
            setRetryCount(c => c + 1);
        }, 3000);
    };

    // --- Client Side Stream Logic ---
    useEffect(() => {
        let stream = null;
        let interval = null;

        if (useClientCamera) {
            const startCamera = async () => {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }

                    // Connect WS
                    const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + `/ws/stream/client_${Date.now()}?modules=${modules || ''}`;
                    // Pass ngrok-skip-browser-warning as a subprotocol to bypass ngrok interstitial
                    const ws = new WebSocket(wsUrl, "ngrok-skip-browser-warning");
                    wsRef.current = ws;

                    ws.onmessage = (event) => {
                        const blob = event.data;
                        const url = URL.createObjectURL(new Blob([blob]));
                        setProcessedImage(url);
                    };

                    ws.onopen = () => {
                        // Start sending frames
                        interval = setInterval(() => {
                            if (videoRef.current && canvasRef.current && ws.readyState === WebSocket.OPEN) {
                                const ctx = canvasRef.current.getContext('2d');
                                ctx.drawImage(videoRef.current, 0, 0, 640, 480);
                                canvasRef.current.toBlob(blob => {
                                    if (blob) ws.send(blob);
                                }, 'image/jpeg', 0.6);
                            }
                        }, 100); // 10 FPS
                    };

                } catch (err) {
                    console.error("Camera Error:", err);
                    alert("Could not access camera. Please allow permissions.");
                    setUseClientCamera(false);
                }
            };
            startCamera();
        }

        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
            if (interval) clearInterval(interval);
            if (wsRef.current) wsRef.current.close();
        };
    }, [useClientCamera, modules]);


    return (
        <div className="video-container" style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }}>
                <button
                    onClick={() => setUseClientCamera(!useClientCamera)}
                    style={{
                        padding: '8px 12px',
                        background: useClientCamera ? '#ef4444' : 'var(--accent-color)',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                >
                    {useClientCamera ? "Stop My Camera" : "Use My Camera"}
                </button>
            </div>

            {useClientCamera ? (
                <>
                    {/* Hidden Capture Elements */}
                    <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
                    <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />

                    {/* Processed Display */}
                    {processedImage ? (
                        <img
                            src={processedImage}
                            alt="Processed Feed"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                            Starting Camera...
                        </div>
                    )}
                </>
            ) : (
                !isError ? (
                    <img
                        src={videoSrc}
                        alt="Live Video Feed"
                        className="video-feed"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={handleError}
                    />
                ) : (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-secondary)', background: '#000'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <p>Stream Disconnected</p>
                            <p style={{ fontSize: '0.8em', opacity: 0.7 }}>Reconnecting...</p>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default VideoFeed;
