import React, { useState, useRef, useEffect } from 'react';
import Header from './Header';

import Footer from './Footer';

const AttendancePage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [reportFilter, setReportFilter] = useState('week'); // week, month

    // Employee State
    const [employees, setEmployees] = useState([
        { id: 'EMP001', name: 'John Doe', dept: 'Engineering', status: 'Active', photo: null, fingerprint: true },
        { id: 'EMP002', name: 'Alice Smith', dept: 'Marketing', status: 'Active', photo: null, fingerprint: true },
        { id: 'EMP003', name: 'Bob Johnson', dept: 'Sales', status: 'Active', photo: null, fingerprint: false },
        { id: 'EMP004', name: 'Clara Oswald', dept: 'HR', status: 'On Leave', photo: null, fingerprint: false },
        { id: 'EMP005', name: 'David Tennant', dept: 'Engineering', status: 'Active', photo: null, fingerprint: true },
    ]);

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null); // For View Modal

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // New Employee Form State
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        dept: 'Engineering',
        status: 'Active',
        photo: null,
        fingerprint: false
    });
    const [isScanning, setIsScanning] = useState(false); // For simulate scan
    const fileInputRef = useRef(null);

    // Mock Data for Dashboard
    const stats = { totalEmployees: employees.length, present: 112, onLeave: 8, late: 4 };
    const logs = [
        { id: 101, name: 'John Doe', time: '08:55 AM', status: 'On Time', device: 'Main Entrance #1' },
        { id: 102, name: 'Alice Smith', time: '09:02 AM', status: 'Late', device: 'Main Entrance #1' },
        { id: 103, name: 'Bob Johnson', time: '08:45 AM', status: 'On Time', device: 'Rear Exit #2' },
        { id: 104, name: 'Clara Oswald', time: '09:10 AM', status: 'Late', device: 'Main Entrance #2' },
        { id: 105, name: 'David Tennant', time: '08:50 AM', status: 'On Time', device: 'Main Entrance #1' },
    ];

    const handleDownload = () => {
        alert(`Downloading ${reportFilter === 'week' ? 'Weekly' : 'Monthly'} Report...`);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewEmployee({ ...newEmployee, photo: reader.result });
                setIsCameraOpen(false); // Close camera if upload is chosen
            };
            reader.readAsDataURL(file);
        }
    };

    // Camera Functions
    const startCamera = async () => {
        setIsCameraOpen(true);
        // Delay slightly to ensure render
        setTimeout(async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access camera");
                setIsCameraOpen(false);
            }
        }, 100);
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, 320, 240);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            setNewEmployee({ ...newEmployee, photo: dataUrl });
            stopCamera();
        }
    };

    // Fingerprint Simulation
    const handleScanFingerprint = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setNewEmployee({ ...newEmployee, fingerprint: true });
            alert("Fingerprint Scanned Successfully!");
        }, 2000); // 2 second mock scan
    };

    const handleAddEmployee = () => {
        const newId = `EMP${String(employees.length + 1).padStart(3, '0')}`;
        const employeeToAdd = { ...newEmployee, id: newId };
        setEmployees([...employees, employeeToAdd]);
        setShowAddModal(false);
        setNewEmployee({ name: '', dept: 'Engineering', status: 'Active', photo: null, fingerprint: false }); // Reset form
        stopCamera(); // Ensure camera is stopped
        alert(`Employee Added Successfully!\nID: ${newId}`);
    };

    const openAddModal = () => {
        setShowAddModal(true);
    };

    // Cleanup camera on unmount or modal close
    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)' }}>

                    {/* Header Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '500', marginBottom: '0.5rem' }}>Attendance Management</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track employee presence and generate reports</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px' }}>
                            {['dashboard', 'reports', 'employees'].map(tab => (
                                <button key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        background: activeTab === tab ? 'var(--accent-cyan)' : 'transparent',
                                        color: activeTab === tab ? '#000' : 'var(--text-secondary)',
                                        border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer',
                                        textTransform: 'capitalize'
                                    }}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DASHBOARD VIEW */}
                    {activeTab === 'dashboard' && (
                        <>
                            {/* Stats Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                                {[
                                    { label: 'Total Employees', value: stats.totalEmployees, color: '#fff' },
                                    { label: 'Present Today', value: stats.present, color: 'var(--success-color)' },
                                    { label: 'On Leave', value: stats.onLeave, color: '#f59e0b' },
                                    { label: 'Late Arrivals', value: stats.late, color: '#ef4444' }
                                ].map((stat, i) => (
                                    <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color, marginBottom: '0.25rem' }}>{stat.value}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '500' }}>Today's Live Updates</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 8px var(--accent-cyan)' }}></span>
                                        Live Stream
                                    </span>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>ID</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Employee</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Time</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Device</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>#{log.id}</td>
                                                <td style={{ padding: '1rem', color: '#fff', fontWeight: '500' }}>{log.name}</td>
                                                <td style={{ padding: '1rem', color: '#fff' }}>{log.time}</td>
                                                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{log.device}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                                        background: log.status === 'On Time' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: log.status === 'On Time' ? 'var(--success-color)' : '#ef4444'
                                                    }}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* REPORTS VIEW */}
                    {activeTab === 'reports' && (
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>Attendance Reports</h3>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <select value={reportFilter} onChange={(e) => setReportFilter(e.target.value)}
                                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--panel-border)', borderRadius: '6px' }}>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                    </select>
                                    <button onClick={handleDownload} style={{ padding: '0.5rem 1rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Download Report ⬇
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', height: '300px', padding: '2rem 0', borderBottom: '1px solid var(--panel-border)', marginBottom: '2rem' }}>
                                {(reportFilter === 'week' ? [95, 98, 92, 96, 94] : [95, 92, 88, 96, 94, 98, 91, 93, 89, 95, 94, 96]).map((h, i) => (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '60%', height: `${h}%`, background: 'var(--accent-cyan)', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{reportFilter === 'week' ? `Day ${i + 1}` : `W${Math.floor(i / 7) + 1}D${(i % 7) + 1}`}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                                Showing data for: <b style={{ color: '#fff' }}>{reportFilter === 'week' ? 'Current Week' : 'Current Month'}</b>
                            </div>
                        </div>
                    )}

                    {/* EMPLOYEES VIEW */}
                    {activeTab === 'employees' && (
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Employee Directory</h3>
                                <button onClick={openAddModal} style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    + Add Employee
                                </button>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>ID</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Name</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Department</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                                        <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{emp.id}</td>
                                            <td style={{ padding: '1rem', color: '#fff', fontWeight: '500' }}>{emp.name}</td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{emp.dept}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                                                    background: emp.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    color: emp.status === 'Active' ? 'var(--success-color)' : '#f59e0b'
                                                }}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button onClick={() => setSelectedEmployee(emp)} style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ADD EMPLOYEE MODAL */}
                {showAddModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                        <div className="glass-panel" style={{ width: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--panel-border)', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, color: '#fff' }}>Add New Employee</h3>
                                <button onClick={() => { setShowAddModal(false); stopCamera(); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                            </div>

                            {/* Auto ID Display */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '6px', border: '1px dashed var(--text-secondary)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                Auto-Generated ID: <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>EMP{String(employees.length + 1).padStart(3, '0')}</span>
                            </div>

                            {/* Form Fields */}
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={newEmployee.name}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Department</label>
                                    <select
                                        value={newEmployee.dept}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, dept: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff' }}>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Sales">Sales</option>
                                        <option value="HR">HR</option>
                                        <option value="Operations">Operations</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Status</label>
                                    <select
                                        value={newEmployee.status}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff' }}>
                                        <option value="Active">Active</option>
                                        <option value="On Leave">On Leave</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Fingerprint Registration */}
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Biometric Registration</label>
                                <button
                                    onClick={handleScanFingerprint}
                                    disabled={newEmployee.fingerprint || isScanning}
                                    style={{
                                        width: '100%', padding: '1rem',
                                        background: newEmployee.fingerprint ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${newEmployee.fingerprint ? 'var(--success-color)' : 'var(--panel-border)'}`,
                                        color: newEmployee.fingerprint ? 'var(--success-color)' : '#fff',
                                        borderRadius: '6px', cursor: newEmployee.fingerprint ? 'default' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                                    }}>
                                    {isScanning ? (
                                        <>
                                            <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                                            Scanning Fingerprint...
                                        </>
                                    ) : newEmployee.fingerprint ? (
                                        <>
                                            <span style={{ fontSize: '1.2rem' }}>✔</span> Fingerprint Registered
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ fontSize: '1.2rem' }}>👆</span> Scan Fingerprint
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Photo Section */}
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Photograph</label>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <button onClick={() => fileInputRef.current.click()} style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
                                        📁 Upload Photo
                                    </button>
                                    <button onClick={startCamera} style={{ flex: 1, padding: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', borderRadius: '4px', cursor: 'pointer' }}>
                                        📷 Take Photo
                                    </button>
                                </div>

                                {/* Preview / Camera Area */}
                                <div style={{ border: '2px dashed var(--panel-border)', padding: '1rem', borderRadius: '6px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

                                    {isCameraOpen ? (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: '240px', borderRadius: '4px' }} />
                                            <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
                                            <button onClick={capturePhoto} style={{ width: '100%', padding: '0.75rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                Capture
                                            </button>
                                        </div>
                                    ) : newEmployee.photo ? (
                                        <img src={newEmployee.photo} alt="Preview" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--accent-cyan)' }} />
                                    ) : (
                                        <div style={{ color: 'var(--text-secondary)' }}>
                                            No photo selected
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handlePhotoUpload}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />
                            </div>

                            <button onClick={handleAddEmployee} style={{ width: '100%', padding: '1rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>
                                Save Employee
                            </button>
                        </div>
                    </div>
                )}

                {/* VIEW EMPLOYEE MODAL */}
                {selectedEmployee && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                        <div className="glass-panel" style={{ width: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--panel-border)', alignItems: 'center' }}>
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setSelectedEmployee(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: '#334155', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '4px solid var(--accent-cyan)', overflow: 'hidden' }}>
                                    {selectedEmployee.photo ? (
                                        <img src={selectedEmployee.photo} alt={selectedEmployee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '4rem', color: '#fff' }}>{selectedEmployee.name[0]}</span>
                                    )}
                                </div>
                                {selectedEmployee.fingerprint && (
                                    <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--success-color)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--bg-dark)', fontSize: '1.2rem' }} title="Fingerprint Registered">
                                        👆
                                    </div>
                                )}
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>{selectedEmployee.name}</h3>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem' }}>{selectedEmployee.id}</div>
                                <span style={{
                                    padding: '0.25rem 1rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold',
                                    background: selectedEmployee.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    color: selectedEmployee.status === 'Active' ? 'var(--success-color)' : '#f59e0b'
                                }}>
                                    {selectedEmployee.status}
                                </span>
                            </div>

                            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Department</div>
                                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{selectedEmployee.dept}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Biometrics</div>
                                    <div style={{ color: selectedEmployee.fingerprint ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: 'bold' }}>
                                        {selectedEmployee.fingerprint ? 'Registered' : 'Not Set'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
            <Footer />
        </div>
    );
};

export default AttendancePage;
