import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const SecurityPanel = () => {
    const { token, user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleChangePassword = async () => {
        if (!newPassword) return;
        try {
            const response = await fetch(`http://localhost:8000/users/${user.username}/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ new_password: newPassword })
            });
            if (response.ok) {
                setMessage('Password updated successfully!');
                setIsEditing(false);
                setNewPassword('');
            } else {
                setMessage('Failed to update password.');
            }
        } catch (e) {
            setMessage('Error updating password.');
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{
                color: '#fff', fontSize: '1rem',
                marginBottom: '1rem', fontWeight: '500'
            }}>Security</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#e2e8f0', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>Account Password</span>
                    {!isEditing ? (
                        <span onClick={() => setIsEditing(true)} style={{ color: 'var(--accent-cyan)', cursor: 'pointer' }}>Update</span>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{ background: '#334155', border: 'none', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                            />
                            <button onClick={handleChangePassword} style={{ background: 'var(--success-color)', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 0.5rem' }}>✓</button>
                            <button onClick={() => setIsEditing(false)} style={{ background: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 0.5rem' }}>✕</button>
                        </div>
                    )}
                </div>
                {message && <div style={{ color: message.includes('success') ? 'var(--success-color)' : '#ef4444', fontSize: '0.8rem' }}>{message}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ background: '#1e293b', aspectRatio: '16/9' }}>
                            {/* Mock Camera Thumbnail */}
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #334155, #1e293b)' }}></div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', color: '#fff', fontSize: '0.75rem', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '4px' }}>CAM 1: Main Entrance</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityPanel;
