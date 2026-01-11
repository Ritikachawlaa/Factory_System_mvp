import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VideoFeed from './components/VideoFeed'
import EmployeeList from './components/EmployeeList'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'

// --- Public Surveillance View ---
const SurveillanceView = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Factory Surveillance
        </h1>
        <a href="/admin" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '0.9rem', border: '1px solid #475569', padding: '0.5rem 1rem', borderRadius: '4px' }}>
          Admin Access
        </a>
      </div>

      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h2 className="title">Live Feed</h2>
            <VideoFeed />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h2 className="title">Active Personnel</h2>
            <EmployeeList />
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Admin Route Wrapper ---
const AdminRoute = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  if (!token) {
    return <Login onLogin={(t) => {
      localStorage.setItem('token', t);
      setToken(t);
    }} />;
  }

  return <AdminDashboard onLogout={() => {
    localStorage.removeItem('token');
    setToken(null);
  }} />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SurveillanceView />} />
        <Route path="/admin" element={<AdminRoute />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
