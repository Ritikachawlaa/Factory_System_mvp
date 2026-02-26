import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';

const VideoFeed = ({ modules }) => {
    return <VideoFeedContent modules={modules} />;
};

const VideoFeedContent = ({ modules, cameraId: propCameraId }) => {
    const { cameraId: paramCameraId } = useParams();
    const cameraId = propCameraId || paramCameraId;
    const { token } = useAuth();

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const pcRef = useRef(null);
    const wsRef = useRef(null);
    const [status, setStatus] = useState('connecting'); // connecting, connected, error
    const [detections, setDetections] = useState([]);
    const [authError, setAuthError] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [isMediaServeDead, setIsMediaServeDead] = useState(false);

    // Performance Tracking & Alerts
    const [showMetrics, setShowMetrics] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const rtcStartTimeRef = useRef(null);
    const [showDetectionAlert, setShowDetectionAlert] = useState(false);
    const alertTimeoutRef = useRef(null);

    // Auth & Modules
    const isMlDisabled = !modules || modules.filter(m => m.enabled || m.status === 'active').length === 0;

    // WebRTC Connection Logic
    const attemptCountRef = useRef(0);
    const MAX_RETRIES = 10;

    useEffect(() => {
        let active = true;
        let reconnectTimer = null;
        let wsReconnectTimer = null;

        const currentController = new AbortController();
        const signal = currentController.signal;

        const connectWebRTC = async () => {
            if (!cameraId || isOffline || isMediaServeDead) return;

            rtcStartTimeRef.current = performance.now();

            try {
                setStatus('connecting');
                setIsOffline(false); // Reset offline status on new connection attempt

                // Keep default STUN servers, MediaMTX provides its own signaling but basic STUN can help
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });
                pcRef.current = pc;

                pc.oniceconnectionstatechange = () => {
                    const state = pc.iceConnectionState;
                    console.log(`[WebRTC] ICE Connection State: ${state}`);
                    if (state === 'failed' || state === 'disconnected') {
                        setStatus('error');
                        if (active && !authError && !isOffline) {
                            if (attemptCountRef.current >= MAX_RETRIES) {
                                console.error('[WebRTC] Max retries reached. Camera marked offline.');
                                setIsOffline(true);
                                cleanup();
                                return;
                            }

                            attemptCountRef.current += 1;
                            const backoffMs = Math.min(3000 * Math.pow(1.5, attemptCountRef.current), 30000);

                            reconnectTimer = setTimeout(() => {
                                console.log(`[WebRTC] Attempting to reconnect (Attempt ${attemptCountRef.current})...`);
                                cleanup();
                                connectWebRTC();
                            }, backoffMs);
                        }
                    } else if (state === 'connected') {
                        attemptCountRef.current = 0; // Reset on success
                        setIsOffline(false);

                        const connectionTimeMs = performance.now() - rtcStartTimeRef.current;
                        fetch(`${API_BASE_URL}/api/metrics/webrtc`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ camera_id: parseInt(cameraId, 10), connection_time_ms: connectionTimeMs })
                        }).catch(err => console.error("Metrics send failed:", err));

                        console.log(`[WebRTC] Connected Successfully in ${connectionTimeMs.toFixed(2)}ms!`);
                        setStatus('connected');
                        // Start WebSocket for detections ONLY after WebRTC succeeds
                        connectWS();
                    }
                };

                pc.ontrack = (event) => {
                    console.log('Received remote track', event.streams[0]);
                    if (videoRef.current && event.streams && event.streams[0]) {
                        videoRef.current.srcObject = event.streams[0];
                    }
                };

                // Add transceivers to receive video
                pc.addTransceiver('video', { direction: 'recvonly' });
                // pc.addTransceiver('audio', { direction: 'recvonly' });

                const WHEP_URL = "https://stream.camai.in/camera1/whep";

                // 1. Create WebRTC Offer
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                // Wait for ICE gathering to complete before sending the offer out
                // MediaMTX WHEP often expects candidates inline
                await new Promise((resolve) => {
                    if (pc.iceGatheringState === 'complete') {
                        resolve();
                    } else {
                        const checkState = () => {
                            if (pc.iceGatheringState === 'complete') {
                                pc.removeEventListener('icegatheringstatechange', checkState);
                                resolve();
                            }
                        };
                        pc.addEventListener('icegatheringstatechange', checkState);
                        // Timeout to avoid hanging forever
                        setTimeout(resolve, 2000);
                    }
                });

                // 2. Send SDP Offer directly to MediaMTX WHEP endpoint
                const whepRes = await fetch(WHEP_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/sdp' },
                    body: pc.localDescription.sdp,
                    signal
                });

                if (!whepRes.ok) {
                    throw new Error(`Failed to negotiate WHEP connection: ${whepRes.status} ${whepRes.statusText}`);
                }

                const answerSdp = await whepRes.text();

                // 3. Set remote description with the answer received
                await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

                console.log('[WebRTC] Direct WHEP Signaling complete');

            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('[WebRTC] Connection aborted during setup');
                    return;
                }
                console.error('[WebRTC] Connection Error:', error);
                if (active && !authError && !isOffline) {
                    setStatus('error');

                    if (attemptCountRef.current >= MAX_RETRIES) {
                        console.error('[WebRTC] Max fetch retries reached. Camera marked offline.');
                        setIsOffline(true);
                        return;
                    }

                    attemptCountRef.current += 1;
                    const backoffMs = Math.min(3000 * Math.pow(1.5, attemptCountRef.current), 30000);

                    reconnectTimer = setTimeout(() => {
                        console.log(`[WebRTC] Reconnecting fetch failure (Attempt ${attemptCountRef.current})...`);
                        cleanup();
                        connectWebRTC();
                    }, backoffMs);
                }
            }
        };

        const cleanup = () => {
            if (pcRef.current) {
                pcRef.current.close();
                pcRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (alertTimeoutRef.current) {
                clearTimeout(alertTimeoutRef.current);
            }
            setShowDetectionAlert(false);
        };

        // === WEBSOCKET CONNECTION (Detections) ===
        let wsAttemptCount = 0;
        const MAX_WS_RETRIES = 10;

        const connectWS = () => {
            if (!cameraId || !active || authError) return; // Don't connect if authError is true
            // Clean up existing WS before creating a new one
            if (wsRef.current) {
                wsRef.current.close();
            }

            // Derive WS URL assuming HTTP/HTTPS base URL protocol
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            // Parse hostname and port if necessary, otherwise construct directly
            const apiHost = API_BASE_URL.replace(/^https?:\/\//, '');
            const wsUrl = `${protocol}//${apiHost}/ws/detections?camera_id=${cameraId}&token=${token}`;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log(`[WebSocket] Connected for detections overlay (Camera: ${cameraId})`);
                wsAttemptCount = 0; // Reset on successful connection
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.detections && Array.isArray(data.detections)) {
                        setDetections(data.detections);

                        // Demo Polish: Show brief alert badge if detections are present
                        if (data.detections.length > 0) {
                            setShowDetectionAlert(true);
                            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
                            alertTimeoutRef.current = setTimeout(() => setShowDetectionAlert(false), 1500);
                        }
                    }
                } catch (e) {
                    console.error('[WebSocket] Error parsing detection message:', e);
                }
            };

            ws.onclose = (e) => {
                console.log(`[WebSocket] Disconnected from detection stream (Code: ${e.code})`);
                if (e.code === 1008) { // 1008 is typically for policy violation, often used for unauthorized
                    console.error('[WebSocket] Unauthorized / Token rejected');
                    setAuthError(true);
                    return; // Do not reconnect if unauthorized
                }
                // If WebRTC is still connected and no auth error, try to regain WS specifically
                if (active && !authError && pcRef.current && pcRef.current.iceConnectionState === 'connected') {
                    if (wsAttemptCount >= MAX_WS_RETRIES) {
                        console.error('[WebSocket] Max retries reached for detection stream. Stopping reconnect.');
                        return;
                    }
                    wsAttemptCount++;
                    const backoffMs = Math.min(3000 * Math.pow(1.5, wsAttemptCount), 30000);
                    console.log(`[WebSocket] Reconnecting in ${(backoffMs / 1000).toFixed(1)}s (attempt ${wsAttemptCount}/${MAX_WS_RETRIES})...`);
                    wsReconnectTimer = setTimeout(() => {
                        connectWS();
                    }, backoffMs);
                }
            };

            ws.onerror = (error) => {
                console.error('[WebSocket] Connection Error:', error);
            };
        };

        connectWebRTC();

        return () => {
            active = false;
            currentController.abort();
            if (reconnectTimer) clearTimeout(reconnectTimer);
            if (wsReconnectTimer) clearTimeout(wsReconnectTimer);
            cleanup();
        };

    }, [cameraId, token, authError]); // Added token and authError to dependencies to react to changes

    // Metrics Polling
    useEffect(() => {
        if (!showMetrics || !cameraId || authError) return;

        let isMounted = true;
        const fetchMetrics = async () => {
            try {
                const streamRes = await fetch(`${API_BASE_URL}/metrics/stream?camera_id=${cameraId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const sysRes = await fetch(`${API_BASE_URL}/metrics/system`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const healthRes = await fetch(`${API_BASE_URL}/health/system`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (streamRes.ok && sysRes.ok && healthRes.ok && isMounted) {
                    const healthData = await healthRes.json();
                    setMetrics({
                        stream: await streamRes.json(),
                        system: await sysRes.json(),
                        health: healthData
                    });

                    // Demo Polish: Safe Auto-Kill Hook handling physical ingress faults
                    if (!healthData.media_stream_active) {
                        setIsMediaServeDead(true);
                        setIsOffline(false);
                        if (pcRef.current) pcRef.current.close();
                    } else if (!healthData.camera_online) {
                        setIsMediaServeDead(false);
                        setIsOffline(true);
                        if (pcRef.current) pcRef.current.close();
                    } else {
                        // Recover safely if it bounds back instantly
                        setIsMediaServeDead(false);
                        setIsOffline(false);
                    }
                }
            } catch (err) {
                // Silently ignore polling errors to avoid console spam during drops
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [showMetrics, cameraId, token, authError]);

    // Canvas Rendering & Resizing
    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        let animationFrameId;
        const ctx = canvas.getContext('2d');

        // ResizeObserver to keep canvas dimensions in sync with video element
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.target === video) {
                    // Update canvas display size to match video element's displayed size
                    canvas.style.width = `${entry.contentRect.width}px`;
                    canvas.style.height = `${entry.contentRect.height}px`;
                }
            }
        });

        resizeObserver.observe(video);

        // Update canvas rect dimensions based on bounding client rect
        // and sync actual drawing context dimensions with displayed
        const renderLoop = () => {
            animationFrameId = requestAnimationFrame(renderLoop);

            // Match canvas internal resolution to its display size
            const rect = video.getBoundingClientRect();
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                canvas.width = rect.width;
                canvas.height = rect.height;
            }

            // Ensure video metadata is loaded before trying to calculate scaling
            if (video.videoWidth === 0 || video.videoHeight === 0) return;

            // Clear previous frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate video scaling to actual displayed element (object-fit: contain simulation)
            const videoRatio = video.videoWidth / video.videoHeight;
            const elementRatio = canvas.width / canvas.height;

            let renderWidth, renderHeight, offsetX, offsetY;

            if (videoRatio > elementRatio) {
                // Video is wider than element
                renderWidth = canvas.width;
                renderHeight = canvas.width / videoRatio;
                offsetX = 0;
                offsetY = (canvas.height - renderHeight) / 2;
            } else {
                // Video is taller than element
                renderWidth = canvas.height * videoRatio;
                renderHeight = canvas.height;
                offsetX = (canvas.width - renderWidth) / 2;
                offsetY = 0;
            }

            // The scale mappings from original video coordinates to displayed coordinates
            const scaleX = renderWidth / video.videoWidth;
            const scaleY = renderHeight / video.videoHeight;

            // Draw bounding boxes
            detections.forEach(det => {
                // det.x, y, w, h are assumed to be in original video resolution coordinates
                // Scale them to the display coordinate system and add the letterbox/pillarbox offsets
                const displayX = offsetX + (det.x * scaleX);
                const displayY = offsetY + (det.y * scaleY);
                const displayW = det.w * scaleX;
                const displayH = det.h * scaleY;

                ctx.strokeStyle = '#00ffcc'; // neon cyan
                ctx.lineWidth = 2;
                ctx.strokeRect(displayX, displayY, displayW, displayH);

                // Draw Label Background
                if (det.class) {
                    ctx.font = '14px sans-serif';
                    // Label text format: class + optional confidence
                    const labelText = det.confidence ? `${det.class} ${(det.confidence * 100).toFixed(0)}%` : det.class;
                    const textWidth = ctx.measureText(labelText).width;

                    ctx.fillStyle = '#00ffcc';
                    ctx.fillRect(displayX, displayY - 20, textWidth + 8, 20);

                    // Draw Label Text
                    ctx.fillStyle = '#000000';
                    ctx.fillText(labelText, displayX + 4, displayY - 5);
                }
            });
        };

        renderLoop();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
        };
    }, [detections]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Monitor Panel Toggle */}
            <button
                onClick={() => setShowMetrics(!showMetrics)}
                style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 60, background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid #555', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
            >
                {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
            </button>

            {/* Metrics Overlay */}
            {showMetrics && metrics && (
                <div style={{ position: 'absolute', top: '40px', right: '10px', zIndex: 60, background: 'rgba(0,0,0,0.8)', color: '#0f0', border: '1px solid #333', borderRadius: '6px', padding: '10px', fontSize: '12px', width: '250px', display: 'flex', flexDirection: 'column', gap: '5px', fontFamily: 'monospace' }}>
                    <div style={{ borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '4px', fontWeight: 'bold' }}>Performance Monitor</div>
                    <div>WebRTC State: <span style={{ color: status === 'connected' ? '#0f0' : '#f00' }}>{status}</span></div>
                    <div>WebRTC Latency: {metrics.stream?.webrtc_connection_time_ms ? `${metrics.stream.webrtc_connection_time_ms.toFixed(0)} ms` : '--'}</div>
                    <div>ML Inference Avg: {metrics.stream?.ml_inference_avg_ms ? `${metrics.stream.ml_inference_avg_ms.toFixed(1)} ms` : 'Idle'}</div>
                    <div style={{ borderBottom: '1px solid #333', paddingBottom: '4px', margin: '4px 0', fontWeight: 'bold' }}>Stream Health</div>
                    <div>ML Engine: <span style={{ color: metrics.health?.ml_engine_active ? '#0f0' : '#f00' }}>{metrics.health?.ml_engine_active ? 'Active' : 'Offline'}</span></div>
                    <div>WS Clients: {metrics.health?.websocket_clients || 0}</div>
                    <div style={{ borderBottom: '1px solid #333', paddingBottom: '4px', margin: '4px 0', fontWeight: 'bold' }}>Server Load</div>
                    <div>CPU Usage: {metrics.system?.cpu_percent}%</div>
                    <div>Memory Usage: {metrics.system?.memory_percent}%</div>
                </div>
            )}

            {authError && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', zIndex: 50 }}>
                    <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</span>
                    <h3>Access Denied</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>You do not have permission to view this camera.</p>
                </div>
            )}
            {isOffline && !authError && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', zIndex: 50 }}>
                    <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎥</span>
                    <h3>Camera Offline</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Unable to connect to the video stream after multiple attempts.</p>
                </div>
            )}

            {!authError && !isOffline && status === 'connecting' && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    Connecting...
                </div>
            )}

            {!authError && !isOffline && !isMediaServeDead && status === 'error' && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, color: '#ffb020', background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,176,32,0.3)', borderTop: '2px solid #ffb020', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Reconnecting...
                </div>
            )}

            {/* AI Disabled State */}
            {isMlDisabled && status === 'connected' && !isOffline && !isMediaServeDead && !authError && (
                <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 40, background: 'rgba(0,0,0,0.6)', color: '#aaa', padding: '8px 16px', borderRadius: '20px', border: '1px solid #444', fontSize: '14px' }}>
                    🤖 AI Modules Disabled
                </div>
            )}

            {/* Demo Detection Alert Badge */}
            <div style={{
                position: 'absolute', top: '20px', right: '50%', transform: 'translateX(50%)', zIndex: 50,
                background: 'linear-gradient(45deg, #ff0055, #ffaa00)', color: '#fff', padding: '8px 20px',
                borderRadius: '30px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255,0,85,0.4)',
                opacity: showDetectionAlert ? 1 : 0, transition: 'opacity 0.2s ease-in-out', pointerEvents: 'none'
            }}>
                ⚠️ Detection Active
            </div>
            <video
                ref={videoRef}
                id="liveVideo"
                autoPlay
                playsInline
                muted
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    zIndex: 1
                }}
            ></video>
            <canvas
                ref={canvasRef}
                id="overlayCanvas"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 2
                }}
            ></canvas>
        </div>
    );
};

export default VideoFeed;
