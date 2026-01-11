import { useState, useEffect } from 'react'
import VideoFeed from './components/VideoFeed'
import RegisterForm from './components/RegisterForm'
import EmployeeList from './components/EmployeeList'
import Login from './components/Login'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshList, setRefreshList] = useState(0);

  const handleLogin = (accessToken) => {
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Face Recognition Attendance
        </h1>
        <button onClick={handleLogout} className="btn" style={{ width: 'auto', backgroundColor: '#334155' }}>Logout</button>
      </div>

      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h2 className="title">Live Surveillance</h2>
            <VideoFeed />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h2 className="title">Register New Employee</h2>
            <RegisterForm onSuccess={() => setRefreshList(p => p + 1)} />
          </div>

          <div className="card">
            <h2 className="title">Registered Employees & Visitors</h2>
            <EmployeeList refreshKey={refreshList} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
