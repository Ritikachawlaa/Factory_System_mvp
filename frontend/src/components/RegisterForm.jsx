import React, { useState, useRef, useEffect } from 'react';
import API_BASE_URL from '../config';

const RegisterForm = ({ onSuccess }) => {
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    // Removed videoRef and canvasRef as webcam support is removed

    // WebCam logic removed in favor of strict file upload or RTSP streams

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
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'ngrok-skip-browser-warning': 'true' },
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

                {!file && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%' }}>
                            <button type="button" className="btn" style={{ backgroundColor: '#334155' }}>Upload Photo</button>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                            />
                        </div>
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
