import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/auth.api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const { token } = useAuth();
    const [showModal, setShowModal] = useState(false);

    // New User State
    const [newUser, setNewUser] = useState({
        name: '',
        department: '',
        username: '',
        password: '',
        permissions: {
            viewCameras: true,
            editSettings: false,
            exportReports: false,
            manageUsers: false
        }
    });

    const fetchUsers = async () => {
        try {
            const data = await authApi.getAllUsers();
            setUsers(data);
        } catch (e) { console.error("Failed to fetch users"); }
    };

    useEffect(() => { fetchUsers(); }, [token]);

    const generateCredentials = () => {
        const randomId = Math.floor(1000 + Math.random() * 9000); // 4-digit ID
        const genUsername = newUser.name ? `${newUser.name.split(' ')[0].toLowerCase()}${randomId}` : `user${randomId}`;
        const genPassword = Math.random().toString(36).slice(-8); // 8-char random string
        setNewUser(prev => ({ ...prev, username: genUsername, password: genPassword }));
    };

    const handleAddUser = async () => {
        if (!newUser.username || !newUser.password) {
            alert("Please generate credentials first.");
            return;
        }

        try {
            // authApi.createUser(username, password, role)
            await authApi.createUser({
                username: newUser.username,
                password: newUser.password,
                role: 'admin' // Defaulting to admin for MVP or add role selector
            });

            alert(`User Created!\nID: ${newUser.username}\nPass: ${newUser.password}`);
            setShowModal(false);
            fetchUsers();
            setNewUser({ name: '', department: '', username: '', password: '', permissions: { viewCameras: true, editSettings: false, exportReports: false, manageUsers: false } });

        } catch (e) { alert("Error creating user: " + e.message); }
    };

    const handleDelete = async (username) => {
        if (!window.confirm(`Delete ${username}?`)) return;
        try {
            await authApi.deleteUser(username);
            fetchUsers();
        } catch (e) { alert("Error deleting user"); }
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, fontWeight: '500' }}>User Management</h3>
                <button onClick={() => setShowModal(true)} style={{
                    background: 'var(--accent-cyan)', color: '#000', border: 'none',
                    padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer'
                }}>+ Add User</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                {users.map(u => (
                    <div key={u.id} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                        background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#334155', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.2rem' }}>
                            {u.username[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontWeight: '500' }}>{u.username}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                {u.username === 'admin' ? 'Administrator' : 'Staff Member'}
                                {/* Mocking extra info display since backend only returns basic user info currently */}
                            </div>
                        </div>
                        {u.username !== 'admin' && (
                            <button onClick={() => handleDelete(u.username)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', width: '500px', border: '1px solid var(--panel-border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Create New User</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                                <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff' }} placeholder="John Doe" />
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Department</label>
                                <select value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff' }}>
                                    <option value="">Select Dept</option>
                                    <option value="Security">Security</option>
                                    <option value="IT">IT Support</option>
                                    <option value="Operations">Operations</option>
                                    <option value="HR">HR</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Credentials</label>
                                <button type="button" onClick={generateCredentials} style={{ color: 'var(--accent-cyan)', background: 'transparent', border: 'none', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Auto-Generate</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input type="text" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="User ID" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff' }} />
                                <input type="text" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Password" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Permissions</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                {Object.keys(newUser.permissions).map(perm => (
                                    <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={newUser.permissions[perm]} onChange={e => setNewUser({ ...newUser, permissions: { ...newUser.permissions, [perm]: e.target.checked } })} />
                                        <span style={{ color: '#cbd5e1', fontSize: '0.9rem', textTransform: 'capitalize' }}>{perm.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handleAddUser} style={{ flex: 1, padding: '0.75rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Create User</button>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', background: 'transparent', color: '#fff', border: '1px solid var(--panel-border)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
