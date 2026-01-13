import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await fetch('http://localhost:8000/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                login(data.access_token);
                navigate('/');
            } else {
                setError('Invalid credentials');
            }
        } catch (e) {
            setError('Connection failed');
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
            color: '#fff',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background Decoration */}
            <div style={{
                position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', zIndex: 0
            }}>
                <div style={{ position: 'absolute', top: '20%', left: '20%', width: '300px', height: '300px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
                <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '300px', height: '300px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
            </div>

            <div style={{
                zIndex: 1,
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                padding: '2.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px', height: '60px', margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem'
                    }}>👁️</div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Vision AI Security System</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155',
                                color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box'
                            }}
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155',
                                color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box'
                            }}
                            placeholder="Enter password"
                        />
                    </div>

                    {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '6px' }}>{error}</div>}

                    <button type="submit" style={{
                        marginTop: '1rem',
                        padding: '0.85rem',
                        background: 'linear-gradient(to right, #0ea5e9, #6366f1)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'opacity 0.2s',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}>Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
