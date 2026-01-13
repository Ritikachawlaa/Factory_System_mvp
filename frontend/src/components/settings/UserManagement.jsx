import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const { token, user: currentUser } = useAuth();
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8000/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setUsers(await response.json());
            }
        } catch (e) {
            console.error("Failed to fetch users");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const handleDelete = async (username) => {
        if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;

        try {
            const response = await fetch(`http://localhost:8000/users/${username}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchUsers();
            } else {
                const data = await response.json();
                alert(data.detail || "Failed to delete user");
            }
        } catch (e) {
            alert("Error deleting user");
        }
    };

    const handleAddUser = async () => {
        // Simple prompt for MVP. Ideal: Modal
        const username = prompt("Enter new username:");
        if (!username) return;
        const password = prompt("Enter password:");
        if (!password) return;

        try {
            const response = await fetch('http://localhost:8000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                fetchUsers();
                alert("User created!");
            } else {
                alert("Failed to create user (might already exist).");
            }
        } catch (e) {
            alert("Error creating user");
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, fontWeight: '500' }}>User Management</h3>
                <button onClick={handleAddUser} style={{
                    background: 'transparent', color: 'var(--accent-cyan)',
                    border: '1px solid var(--accent-cyan)',
                    padding: '0.25rem 0.75rem', borderRadius: '4px',
                    fontSize: '0.8rem', cursor: 'pointer'
                }}>Add User</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {users.map(u => (
                    <div key={u.id} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px'
                    }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                            {u.username[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{u.username}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                {u.username === 'admin' ? 'Administrator' : 'User'}
                            </div>
                        </div>
                        {u.username !== 'admin' && (
                            <div onClick={() => handleDelete(u.username)} style={{ color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer', padding: '0 0.5rem' }}>
                                🗑️
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Security Settings</h4>
                {/* Reused in SecurityPanel, just keeping static links here or component composition? 
                     The original design had these inside UserManagement. I will keep them but maybe wire them up later or remove if redundant with SecurityPanel. 
                     Actually, the prompt asked to connect "User Management" AND "Security". Logic suggests separating concerns.
                     I'll verify if SecurityPanel is rendered separately. Yes, in SettingsPage.jsx it is separate.
                     So I can simplify this component to just Users. */}
            </div>
        </div>
    );
};

export default UserManagement;
