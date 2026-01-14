import React, { useState, useEffect } from 'react';
import ManageEmployees from './ManageEmployees';
import ManageCameras from './ManageCameras';
import RegisterForm from './RegisterForm';

import ManageViolations from './ManageViolations';
import API_BASE_URL from '../config';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ employees: 0, cameras: 0, users: 1 });

    useEffect(() => {
        // Fetch simple stats
        const loadStats = async () => {
            try {
                const eRes = await fetch(`${API_BASE_URL}/employees`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                const cRes = await fetch(`${API_BASE_URL}/cameras`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                const eData = await eRes.json();
                const cData = await cRes.json();
                setStats({ employees: eData.length, cameras: cData.length, users: 1 });
            } catch (e) { }
        };
        loadStats();
    }, [activeTab]); // Refresh when switching tabs

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <h3 style={{ fontSize: '3rem', margin: '0 0 0.5rem 0', color: '#60a5fa' }}>{stats.employees}</h3>
                            <p style={{ color: '#94a3b8', margin: 0 }}>Registered Personnel</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <h3 style={{ fontSize: '3rem', margin: '0 0 0.5rem 0', color: '#34d399' }}>{stats.cameras}</h3>
                            <p style={{ color: '#94a3b8', margin: 0 }}>Active Cameras</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <h3 style={{ fontSize: '3rem', margin: '0 0 0.5rem 0', color: '#a78bfa' }}>{stats.users}</h3>
                            <p style={{ color: '#94a3b8', margin: 0 }}>System Admins</p>
                        </div>
                    </div>
                );
            case 'personnel':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="card">
                            <h2 className="title">Add New Employee</h2>
                            <RegisterForm onSuccess={() => { }} />
                        </div>
                        <ManageEmployees />
                    </div>
                );
            case 'cameras':
                return <ManageCameras />;
            case 'violations':
                return <ManageViolations />;
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a' }}>
            {/* Sidebar */}
            <div style={{ width: '260px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '3rem', paddingLeft: '1rem', color: '#f8fafc' }}>
                    Admin Panel
                </h1>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <SidebarItem label="Overview" icon="📊" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarItem label="Personnel" icon="👥" active={activeTab === 'personnel'} onClick={() => setActiveTab('personnel')} />
                    <SidebarItem label="Cameras" icon="📹" active={activeTab === 'cameras'} onClick={() => setActiveTab('cameras')} />
                    <SidebarItem label="Safety Logs" icon="⚠️" active={activeTab === 'violations'} onClick={() => setActiveTab('violations')} />
                </nav>

                <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                    <button onClick={onLogout} className="btn" style={{ backgroundColor: '#dc2626', width: '100%' }}>
                        Logout
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                        Logged in as admin
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 3rem' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '2rem', margin: 0, textTransform: 'capitalize' }}>{activeTab}</h2>
                    <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>View Live Monitor</span>
                        <span>→</span>
                    </a>
                </header>
                {renderContent()}
            </div>
        </div>
    );
};

const SidebarItem = ({ label, icon, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: active ? '#3b82f6' : 'transparent',
            color: active ? 'white' : '#94a3b8',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '1rem',
            transition: 'all 0.2s',
            fontWeight: active ? '600' : '400'
        }}
    >
        <span>{icon}</span>
        {label}
    </button>
);

export default AdminDashboard;
