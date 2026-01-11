import React, { useState, useRef, useEffect } from 'react';

const RegisterForm = ({ onSuccess }) => {
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOpen(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setMessage({ type: 'error', text: 'Could not access camera' });
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraOpen(false);
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const capturedFile = new File([blob], "webcam-snapshot.jpg", { type: "image/jpeg" });
                setFile(capturedFile);
                stopCamera();
            }, 'image/jpeg');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!name || !file) {
            setMessage({ type: 'error', text: 'Please provide both name and photo' });
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: 'Employee registered successfully!' });
                setName('');
                setFile(null);
                onSuccess();
            } else {
                const errorData = await response.json();
                setMessage({ type: 'error', text: errorData.detail || 'Registration failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Is backend running?' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="input-group">
                <label className="input-label">Employee Name</label>
                <input
                    type="text"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    required
                />
            </div>

            <div className="input-group">
                <label className="input-label">Photo</label>

                {!isCameraOpen && !file && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={startCamera} className="btn" style={{ backgroundColor: '#475569' }}>
                            Take Photo
                        </button>
                        <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%' }}>
                            <button type="button" className="btn" style={{ backgroundColor: '#334155' }}>Upload File</button>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                )}

                {isCameraOpen && (
                    <div style={{ marginBottom: '1rem' }}>
                        <video ref={videoRef} autoPlay style={{ width: '100%', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}></video>
                        <button type="button" onClick={capturePhoto} className="btn" style={{ marginTop: '0.5rem' }}>Capture</button>
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                    </div>
                )}

                {file && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.875rem' }}>{file.name}</span>
                        <button type="button" onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>Remove</button>
                    </div>
                )}
            </div>

            {message && (
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    backgroundColor: message.type === 'error' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    color: message.type === 'error' ? '#fca5a5' : '#86efac',
                    fontSize: '0.875rem'
                }}>
                    {message.text}
                </div>
            )}

            <button type="submit" className="btn" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register Employee'}
            </button>
        </form>
    );
};

export default RegisterForm;
