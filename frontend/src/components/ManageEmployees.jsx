import React, { useEffect, useState } from 'react';

const ManageEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [viewImage, setViewImage] = useState(null); // URL for modal

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/employees');
            if (res.ok) {
                setEmployees(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this employee?")) return;
        try {
            const res = await fetch(`http://localhost:8000/employees/${id}`, { method: 'DELETE' });
            if (res.ok) fetchEmployees();
        } catch (error) {
            console.error(error);
        }
    };

    const startEdit = (emp) => {
        setEditingId(emp.id);
        setEditName(emp.name);
    }

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    }

    const saveEdit = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName })
            });
            if (res.ok) {
                fetchEmployees();
                cancelEdit();
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="card">
            <h2 className="title">Manage Personnel</h2>
            {loading ? <p>Loading...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #475569' }}>
                            <th style={{ padding: '0.5rem' }}>Snapshot</th>
                            <th style={{ padding: '0.5rem' }}>Name</th>
                            <th style={{ padding: '0.5rem' }}>Type</th>
                            <th style={{ padding: '0.5rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id} style={{ borderBottom: '1px solid #334155' }}>
                                <td style={{ padding: '0.5rem' }}>
                                    {emp.image_url ? (
                                        <img
                                            src={emp.image_url}
                                            alt=""
                                            style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover', cursor: 'zoom-in' }}
                                            onClick={() => setViewImage(emp.image_url)}
                                        />
                                    ) : (
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#475569' }}></div>
                                    )}
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    {editingId === emp.id ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                className="input-field"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                style={{ padding: '0.25rem' }}
                                            />
                                            <button onClick={() => saveEdit(emp.id)} style={{ background: '#22c55e', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✅</button>
                                            <button onClick={cancelEdit} style={{ background: '#94a3b8', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>❌</button>
                                        </div>
                                    ) : (
                                        <span>{emp.name}</span>
                                    )}
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    <span className={`badge ${emp.name.startsWith("Visitor_") ? 'visitor' : 'employee'}`}
                                        style={{
                                            backgroundColor: emp.name.startsWith("Visitor_") ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                            color: emp.name.startsWith("Visitor_") ? '#facc15' : '#4ade80'
                                        }}>
                                        {emp.name.startsWith("Visitor_") ? 'Visitor' : 'Employee'}
                                    </span>
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => startEdit(emp)}
                                            style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(emp.id)}
                                            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Image Modal */}
            {viewImage && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    onClick={() => setViewImage(null)}
                >
                    <img src={viewImage} style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} />
                    <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
                </div>
            )}
        </div>
    );
};

export default ManageEmployees;
