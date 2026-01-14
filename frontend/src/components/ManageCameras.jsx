import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config';

const ManageCameras = () => {
    const [cameras, setCameras] = useState([]);
    const [newName, setNewName] = useState('');
    const [newSource, setNewSource] = useState('');

    const fetchCameras = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/cameras`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
            if (res.ok) setCameras(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCameras();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/cameras`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ name: newName, source: newSource })
            });
            if (res.ok) {
                setNewName('');
                setNewSource('');
                fetchCameras();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Remove this camera?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/cameras/${id}`, {
                method: 'DELETE',
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            if (res.ok) fetchCameras();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="card">
            <h2 className="title">Manage Cameras</h2>

            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input className="input-field" placeholder="Camera Name (e.g. Main Gate)" value={newName} onChange={e => setNewName(e.target.value)} required />
                <input className="input-field" placeholder="Source (0 for Webcam, URL for RTSP)" value={newSource} onChange={e => setNewSource(e.target.value)} required />
                <button type="submit" className="btn" style={{ width: 'auto' }}>Add</button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {cameras.map(cam => (
                    <li key={cam.id} className="employee-item">
                        <div style={{ flex: 1 }}>
                            <strong>{cam.name}</strong> <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>({cam.source})</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <a
                                href={`${API_BASE_URL}/video_feed?camera_id=${cam.id}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    textDecoration: 'none',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                View
                            </a>
                            <button onClick={() => handleDelete(cam.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageCameras;
