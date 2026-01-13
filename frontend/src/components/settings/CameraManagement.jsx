import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const CameraManagement = () => {
    const [cameras, setCameras] = useState([]);
    const { token } = useAuth();

    const fetchCameras = async () => {
        try {
            const res = await fetch('http://localhost:8000/cameras');
            if (res.ok) setCameras(await res.json());
        } catch (e) {
            console.error("Failed to fetch cameras");
        }
    };

    useEffect(() => {
        fetchCameras();
    }, []);

    const handleAdd = async () => {
        const name = prompt("Camera Name:");
        if (!name) return;
        const source = prompt("RTSP Source (or '0' for Webcam):", "0");
        if (!source) return;

        try {
            await fetch('http://localhost:8000/cameras', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, source })
            });
            fetchCameras();
        } catch (e) {
            alert("Error adding camera");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete camera?")) return;
        try {
            await fetch(`http://localhost:8000/cameras/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCameras();
        } catch (e) {
            alert("Error deleting camera");
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, fontWeight: '500' }}>Cameras</h3>
                <button onClick={handleAdd} style={{
                    background: 'transparent', color: 'var(--accent-cyan)',
                    border: '1px solid var(--accent-cyan)',
                    padding: '0.25rem 0.75rem', borderRadius: '4px',
                    fontSize: '0.8rem', cursor: 'pointer'
                }}>Add Camera</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cameras.map(cam => (
                    <div key={cam.id} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{cam.name}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{cam.source}</div>
                        </div>
                        <div onClick={() => handleDelete(cam.id)} style={{ color: '#ef4444', cursor: 'pointer' }}>🗑️</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CameraManagement;
