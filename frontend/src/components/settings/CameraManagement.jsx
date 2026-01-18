import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config';

const CameraManagement = () => {
    const [cameras, setCameras] = useState([]);
    const { token } = useAuth();

    // Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCamera, setEditingCamera] = useState(null); // null means adding, object means editing
    const [formData, setFormData] = useState({ name: '', rtsp: '', models: [], status: 'Online' });

    // Available Models
    const aiModels = [
        'PPE Detection',
        'Fault Detection',
        'Fight Detection',
        'Camera Tampering',
        'Box Production',
        'People Counting',
        'Entry/Exit Count',
        'Intrusion Detection',
        'Animal Detection',
        'Face Recognition'
    ];

    const fetchCameras = async () => {
        // Mock Data Implementation for MVP
        // In real backend, this would be a GET request
        // const res = await fetch(`${API_BASE_URL}/cameras`);

        // Using mock data that matches CamerasPage for consistency
        const mockCameras = [
            { id: 101, name: 'Main Entrance', rtsp: 'rtsp://192.168.1.101/stream', models: ['Face Recognition', 'People Counting'], status: 'Online' },
            { id: 102, name: 'Warehouse A', rtsp: 'rtsp://192.168.1.102/stream', models: ['PPE Detection'], status: 'Recording' },
            { id: 103, name: 'Perimeter Fence', rtsp: 'rtsp://192.168.1.103/stream', models: ['Intrusion Detection', 'Animal Detection'], status: 'Offline' }
        ];

        // Simulate merge with existing state if needed, or just set from "backend"
        // For this demo, we'll initialize if empty, otherwise keep state (simulating persistence)
        if (cameras.length === 0) {
            setCameras(mockCameras);
        }
    };

    useEffect(() => {
        fetchCameras();
    }, []);

    // Form Handlers
    const openAddModal = () => {
        setEditingCamera(null);
        setFormData({ name: '', rtsp: '', models: [], status: 'Online' });
        setShowEditModal(true);
    };

    const openEditModal = (cam) => {
        setEditingCamera(cam);
        setFormData({ ...cam });
        setShowEditModal(true);
    };

    const handleSave = () => {
        if (editingCamera) {
            // Edit Mode
            setCameras(cameras.map(c => c.id === editingCamera.id ? { ...formData, id: c.id } : c));
        } else {
            // Add Mode
            const newId = Math.max(...cameras.map(c => c.id), 100) + 1;
            setCameras([...cameras, { ...formData, id: newId }]);
        }
        setShowEditModal(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this camera? This action cannot be undone.')) {
            setCameras(cameras.filter(c => c.id !== id));
        }
    };

    const toggleModel = (model) => {
        if (formData.models.includes(model)) {
            setFormData({ ...formData, models: formData.models.filter(m => m !== model) });
        } else {
            setFormData({ ...formData, models: [...formData.models, model] });
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ color: '#fff', fontSize: '1.25rem', margin: 0, fontWeight: '500' }}>Camera Administration</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Manage camera feeds, configurations, and AI assignments</p>
                </div>
                <button onClick={openAddModal} style={{
                    background: 'var(--accent-cyan)', color: '#000',
                    border: 'none', padding: '0.75rem 1.25rem', borderRadius: '6px',
                    fontWeight: 'bold', cursor: 'pointer'
                }}>+ Add Camera</button>
            </div>

            {/* Table View */}
            <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--panel-border)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)', zIndex: 10 }}>
                        <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Camera Name</th>
                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>RTSP Source / Device</th>
                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Active AI Models</th>
                            <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cameras.map(cam => (
                            <tr key={cam.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', color: '#fff', fontWeight: '500' }}>{cam.name}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{cam.rtsp}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                        background: cam.status === 'Offline' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                                        color: cam.status === 'Offline' ? '#ef4444' : 'var(--success-color)'
                                    }}>{cam.status}</span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {cam.models.length > 0 ? cam.models.map(m => (
                                            <span key={m} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                                {m}
                                            </span>
                                        )) : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>None</span>}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button onClick={() => openEditModal(cam)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', marginRight: '1rem', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDelete(cam.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit/Add Modal */}
            {showEditModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="glass-panel" style={{ width: '600px', padding: '2rem', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ color: '#fff', margin: 0 }}>{editingCamera ? 'Edit Camera Details' : 'Add New Camera'}</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Camera Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff' }}>
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
                                    <option value="Recording">Recording</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>RTSP Stream URL / Device ID</label>
                            <input
                                type="text"
                                value={formData.rtsp}
                                onChange={(e) => setFormData({ ...formData, rtsp: e.target.value })}
                                placeholder="rtsp://admin:password@192.168.1.x:554/stream"
                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Assigned AI Models</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--panel-border)' }}>
                                {aiModels.map(m => (
                                    <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', background: formData.models.includes(m) ? 'rgba(6, 182, 212, 0.1)' : 'transparent', border: formData.models.includes(m) ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.models.includes(m)}
                                            onChange={() => toggleModel(m)}
                                            style={{ accentColor: 'var(--accent-cyan)', width: '16px', height: '16px' }}
                                        />
                                        <span style={{ color: formData.models.includes(m) ? '#fff' : 'var(--text-secondary)', fontSize: '0.9rem' }}>{m}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={() => setShowEditModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleSave} style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraManagement;
