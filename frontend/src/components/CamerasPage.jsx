import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import API_BASE_URL from '../config';

const CamerasPage = () => {
    // State
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null); // For Detail View
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All'); // New Filter State

    // Edit/Add State
    const [editingCamera, setEditingCamera] = useState(null); // For Edit Modal (reused showAddModal)
    const [newCamera, setNewCamera] = useState({ name: '', rtsp: '', models: [], status: 'Online' });

    // Data Models
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

    // Mock Data for Dynamic Detail View
    const getModuleSpecificLogs = (module) => {
        switch (module) {
            case 'Face Recognition':
                return [
                    { id: 1, type: 'Face ID', time: '10:42 AM', message: 'Identified: John Doe (Manager)', color: '#3b82f6' },
                    { id: 2, type: 'Face ID', time: '10:40 AM', message: 'Unknown Person Detected', color: '#ef4444' },
                    { id: 3, type: 'Face ID', time: '10:15 AM', message: 'Identified: Sarah Smith (HR)', color: '#3b82f6' }
                ];
            case 'PPE Detection':
                return [
                    { id: 1, type: 'Violation', time: '10:45 AM', message: 'No Helmet Detected', color: '#ef4444' },
                    { id: 2, type: 'Compliance', time: '10:30 AM', message: 'Safety Vest Verified', color: '#10b981' },
                    { id: 3, type: 'Violation', time: '09:15 AM', message: 'No Safety Boots', color: '#ef4444' }
                ];
            case 'Start Fire':
            case 'Fire/Smoke':
                return [
                    { id: 1, type: 'Critical', time: '10:05 AM', message: 'Smoke Detected in Sector 4', color: '#ef4444' }
                ];
            default: // Generic Alerts
                return [
                    { id: 1, type: 'Intrusion', time: '10:45 AM', message: 'Person detected in restricted zone', color: '#ef4444' },
                    { id: 2, type: 'PPE', time: '09:30 AM', message: 'Helmet missing', color: '#f59e0b' },
                    { id: 3, type: 'Motion', time: '08:15 AM', message: 'Movement at receiving dock', color: '#3b82f6' },
                ];
        }
    };

    useEffect(() => {
        // Fetch existing cameras or use mock if empty
        const fetchCameras = async () => {
            try {
                // In a real app, this would come from the backend. 
                const initialCameras = [
                    { id: 101, name: 'Main Entrance', rtsp: 'webcam', models: ['Face Recognition', 'People Counting'], status: 'Online' },
                    { id: 102, name: 'Warehouse A', rtsp: 'rtsp://192.168.1.102/stream', models: ['PPE Detection'], status: 'Recording' },
                    { id: 103, name: 'Perimeter Fence', rtsp: 'rtsp://192.168.1.103/stream', models: ['Intrusion Detection', 'Animal Detection'], status: 'Offline' }
                ];
                setCameras(initialCameras);
            } catch (e) { console.error(e); }
        };
        fetchCameras();
    }, []);

    // Filtered Cameras
    const filteredCameras = selectedFilter === 'All'
        ? cameras
        : cameras.filter(cam => cam.models.includes(selectedFilter));

    // Detail View State
    const [detailViewMode, setDetailViewMode] = React.useState('All');
    const [isLive, setIsLive] = useState(true);
    const [playbackTime, setPlaybackTime] = useState(0); // 0 = Live, -X = seconds ago

    // Sync Detail View Mode with Global Filter or Default
    useEffect(() => {
        if (selectedCamera) {
            // If global filter is specific and applies to this camera, use it.
            if (selectedFilter !== 'All' && selectedCamera.models.includes(selectedFilter)) {
                setDetailViewMode(selectedFilter);
            } else if (selectedCamera.models && selectedCamera.models.length > 0) {
                // AUTO-SELECT: Default to the first active model if All is selected
                setDetailViewMode(selectedCamera.models[0]);
            } else {
                setDetailViewMode('All');
            }
        }
    }, [selectedCamera, selectedFilter]);

    // Helper to map UI filter to backend module param
    const getModuleParam = (filter) => {
        switch (filter) {
            case 'Face Recognition': return 'face';
            case 'PPE Detection': return 'ppe';
            case 'All': return ''; // Default runs all configured in backend
            default: return ''; // Default fallback (e.g. for 'People Counting' if not mapped yet)
        }
    };

    // Webcam Logic REMOVED in favor of Backend Stream
    // The backend now handles the webcam stream via /video_feed?source=0

    const handleGoLive = () => {
        setIsLive(true);
        setPlaybackTime(0);
    };

    const handleJump = (seconds) => {
        setIsLive(false);
        setPlaybackTime(prev => prev + seconds); // e.g., -5s
    };

    // Handlers
    const openAddModal = () => {
        setEditingCamera(null);
        setNewCamera({ name: '', rtsp: '', models: [], status: 'Online' });
        setShowAddModal(true);
    };

    const openEditModal = (cam) => {
        setEditingCamera(cam);
        setNewCamera({ ...cam });
        setShowAddModal(true);
    };

    const handleSaveCamera = () => {
        if (!newCamera.name || !newCamera.rtsp) return;

        if (editingCamera) {
            // Edit
            setCameras(cameras.map(c => c.id === editingCamera.id ? { ...newCamera, id: c.id } : c));
        } else {
            // Add
            const newId = Math.max(...cameras.map(c => c.id), 100) + 1;
            setCameras([...cameras, { ...newCamera, id: newId }]);
        }
        setShowAddModal(false);
    };

    const handleDeleteCamera = (id) => {
        if (window.confirm('Are you sure you want to delete this camera? This action cannot be undone.')) {
            setCameras(cameras.filter(c => c.id !== id));
        }
    };

    const toggleNewCameraModel = (model) => {
        if (newCamera.models.includes(model)) {
            setNewCamera({ ...newCamera, models: newCamera.models.filter(m => m !== model) });
        } else {
            setNewCamera({ ...newCamera, models: [...newCamera.models, model] });
        }
    };

    // Render Sidebar Content based on Detail Mode
    const renderSidebarContent = () => {
        if (detailViewMode === 'Face Recognition') {
            return (
                <div style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>

                    {/* Module Header */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Face Recognition</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--success-color)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>● Live</span>
                        </div>
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '1rem' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Proccessing FPS</div>
                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>24.5 FPS</div>
                        </div>
                    </div>

                    {/* Detailed Logs List */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <div style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recognized Individuals</h4>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#fff', background: 'var(--accent-cyan)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>All</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Known</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Unknown</span>
                            </div>
                        </div>

                        <div style={{ padding: '0.5rem' }}>
                            {[
                                { name: 'Ritika', time: '14:50:44', conf: '53.5%', color: '#10b981' },
                                { name: 'Ritika', time: '14:49:51', conf: '69.9%', color: '#10b981' },
                                { name: 'Ritika', time: '14:49:40', conf: '69.9%', color: '#10b981' },
                                { name: 'Ritika', time: '14:49:00', conf: '50.2%', color: '#10b981' },
                                { name: 'Ritika', time: '14:48:58', conf: '58.2%', color: '#10b981' },
                                { name: 'Ritika', time: '14:43:19', conf: '67.4%', color: '#10b981' },
                                { name: 'Ritika', time: '14:43:16', conf: '73.1%', color: '#10b981' }
                            ].map((face, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    {/* Avatar */}
                                    <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: face.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        {face.name[0]}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '500' }}>{face.name}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{face.time}</div>
                                    </div>

                                    {/* Confidence */}
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', fontWeight: 'bold' }}>{face.conf}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (detailViewMode === 'PPE Detection') {
            return (
                <div style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Module Header */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>PPE Logs</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--success-color)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>● Active</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Helmet</div>
                                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>100%</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Vest</div>
                                <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem' }}>85%</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <div style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem' }}>
                            <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Violations</h4>
                        </div>
                        <div style={{ padding: '0.5rem' }}>
                            {[
                                { type: 'Missing Safety Vest', loc: 'Restricted Zone', time: '1 min ago', severity: 'High' },
                                { type: 'Missing Helmet', loc: 'Entry Gate A', time: '5 min ago', severity: 'Medium' },
                                { type: 'Missing Gloves', loc: 'Assembly Line', time: '12 min ago', severity: 'Low' },
                                { type: 'Missing Safety Vest', loc: 'Review Area', time: '15 min ago', severity: 'High' },
                            ].map((v, i) => (
                                <div key={i} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem' }}>{v.type}</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{v.time}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>📍 {v.loc}</span>
                                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'var(--text-secondary)' }}>{v.severity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Default (All/Generic)
        return (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <h3 style={{ color: '#fff', fontSize: '1rem', margin: '0 0 1rem 0' }}>Quick Settings</h3>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Active AI Models</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedCamera.models && selectedCamera.models.map(m => (
                            <div key={m} style={{ padding: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '4px', color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                                {m}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Recent Alerts</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid #ef4444', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.8rem' }}>Intrusion</span>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>10:45 AM</span>
                            </div>
                            <div style={{ color: '#fff', fontSize: '0.9rem', marginTop: '0.25rem' }}>Person detected in restricted zone</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />

            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)' }}>

                {/* Top Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '500' }}>Camera Management</h2>
                        <span style={{ color: 'var(--text-secondary)' }}>
                            {filteredCameras.length} Active Feeds {selectedFilter !== 'All' && `(${selectedFilter})`}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* Module Filter Dropdown */}
                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            style={{ padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            <option value="All">All Modules</option>
                            {aiModels.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>

                        <button
                            onClick={openAddModal}
                            style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                            + Add Camera
                        </button>
                    </div>
                </div>

                {/* GRID VIEW (ONLY VIEW) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                    {filteredCameras.length > 0 ? (
                        filteredCameras.map(cam => (
                            <div key={cam.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Card Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{cam.name}</h3>
                                    <span style={{
                                        fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                        background: cam.status === 'Offline' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                                        color: cam.status === 'Offline' ? '#ef4444' : 'var(--success-color)'
                                    }}>{cam.status}</span>
                                </div>

                                {/* Feed Preview (Clickable) */}
                                <div
                                    onClick={() => setSelectedCamera(cam)}
                                    style={{
                                        height: '220px', background: '#000', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', position: 'relative',
                                        border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                    {/* Mock Video Feed placeholder */}
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Click to view live stream</div>
                                        <div style={{ color: '#475569', fontSize: '0.7rem', marginTop: '0.25rem' }}>{cam.rtsp}</div>
                                    </div>
                                    {/* Overlay icon */}
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%)', opacity: 0, transition: 'opacity 0.2s', background: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '50%' }} className="play-icon">
                                        ▶
                                    </div>
                                </div>

                                {/* Models Tag */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Models</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {cam.models && cam.models.length > 0 ? (
                                            cam.models.slice(0, 3).map(m => ( // Limit tags to 3 for neatness
                                                <span key={m} style={{ fontSize: '0.7rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                                                    {m}
                                                </span>
                                            ))
                                        ) : (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>None</span>
                                        )}
                                        {cam.models && cam.models.length > 3 && (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>+{cam.models.length - 3} more</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--panel-border)', display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => openEditModal(cam)}
                                        style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCamera(cam.id)}
                                        style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                            No cameras found matching "{selectedFilter}".
                        </div>
                    )}
                </div>

            </main>

            <Footer />

            {/* ADD/EDIT CAMERA MODAL */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="glass-panel" style={{ width: '500px', padding: '2rem', border: '1px solid var(--accent-cyan)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>{editingCamera ? 'Edit Camera' : 'Add New Camera'}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Camera Name</label>
                                <input
                                    type="text" placeholder="e.g., Gate 1"
                                    value={newCamera.name} onChange={e => setNewCamera({ ...newCamera, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>RTSP Stream URL</label>
                                <input
                                    type="text" placeholder="rtsp://..."
                                    value={newCamera.rtsp} onChange={e => setNewCamera({ ...newCamera, rtsp: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '4px' }}
                                />
                            </div>

                            {/* Status (Only for Edit or Add) */}
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Status</label>
                                <select
                                    value={newCamera.status} onChange={e => setNewCamera({ ...newCamera, status: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '4px' }}>
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
                                    <option value="Recording">Recording</option>
                                </select>
                            </div>

                            {/* Multi-select for Models */}
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Select AI Models</label>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--panel-border)' }}>
                                    {aiModels.map(m => (
                                        <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', transition: 'background 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={newCamera.models.includes(m)}
                                                onChange={() => toggleNewCameraModel(m)}
                                                style={{ accentColor: 'var(--accent-cyan)', width: '16px', height: '16px' }}
                                            />
                                            <span style={{ color: '#fff', fontSize: '0.9rem' }}>{m}</span>
                                        </label>
                                    ))}
                                </div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {newCamera.models.length} models selected
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={() => setShowAddModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleSaveCamera} style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{editingCamera ? 'Save Changes' : 'Add Camera'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL VIEW (BIG TAB) */}
            {selectedCamera && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ color: '#fff', margin: 0 }}>{selectedCamera.name}</h2>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.25rem' }}>
                                <span style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>{selectedCamera.rtsp}</span>
                                <span style={{ background: 'var(--accent-cyan)', color: '#000', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '10px', fontWeight: 'bold' }}>
                                    {detailViewMode === 'All' ? 'Standard View' : detailViewMode}
                                </span>
                                {!isLive && (
                                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        Running {Math.abs(playbackTime)}s Behind
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedCamera(null)}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#fff',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                        {/* Main Feed */}
                        <div style={{ flex: 2, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            {selectedCamera.rtsp === 'webcam' ? (
                                <img
                                    src={`${API_BASE_URL}/video_feed?source=0&modules=${getModuleParam(detailViewMode)}&ts=${Date.now()}`}
                                    alt="Live Feed"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <>
                                    <div style={{ fontSize: '3rem', color: '#334155' }}>Live RTSP Feed</div>
                                </>
                            )}

                            {/* PLAYBACK CONTROLS OVERLAY */}
                            <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', background: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '8px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {/* Timeline Scrubber (Visual) */}
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginBottom: '1rem', position: 'relative', cursor: 'pointer' }}>
                                    <div style={{ width: isLive ? '100%' : '80%', height: '100%', background: isLive ? 'var(--accent-cyan)' : '#ef4444', borderRadius: '2px', position: 'absolute', right: 0 }}></div>
                                    <div style={{ position: 'absolute', right: isLive ? '0' : '20%', top: '-6px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', cursor: 'grab' }}></div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <button onClick={() => handleJump(-5)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
                                            ⏪ -5s
                                        </button>
                                        <button style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #fff', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            {isLive ? '⏸' : '▶'}
                                        </button>
                                        <button onClick={() => handleJump(5)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
                                            +5s ⏩
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <span style={{ color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                            {isLive ? 'LIVE' : `-00:0${Math.abs(playbackTime)}`}
                                        </span>
                                        <button
                                            onClick={handleGoLive}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: isLive ? 'var(--accent-cyan)' : 'transparent',
                                                color: isLive ? '#000' : 'var(--accent-cyan)',
                                                border: `1px solid var(--accent-cyan)`,
                                                borderRadius: '4px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}>
                                            {isLive ? '• LIVE' : 'GO LIVE'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Data - DYNAMIC based on detailViewMode */}
                        <div style={{ flex: 1, maxWidth: '400px', borderLeft: '1px solid var(--panel-border)', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                            {renderSidebarContent()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CamerasPage;
