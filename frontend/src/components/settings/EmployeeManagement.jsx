import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const { token } = useAuth();

    const fetchEmployees = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/employees`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (res.ok) setEmployees(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAdd = async () => {
        // Needs a file input. We'll use a hidden input trick or simple prompt flow won't work for files.
        // For MVP, prompts are hard for files. I will make a basic UI form inside the component.
        document.getElementById('emp-file-input').click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const name = prompt("Enter Employee Name:");
        if (!name) return;

        const formData = new FormData();
        formData.append('name', name);
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/employees`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: formData
            });
            if (res.ok) {
                alert("Employee added!");
                fetchEmployees();
            } else {
                const d = await res.json();
                alert(d.detail || "Error adding employee");
            }
        } catch (e) {
            alert("Error");
        }
        // Reset input
        e.target.value = null;
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete employee?")) return;
        try {
            await fetch(`${API_BASE_URL}/employees/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            fetchEmployees();
        } catch (e) {
            alert("Error deleting employee");
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, fontWeight: '500' }}>Employees</h3>
                <input type="file" id="emp-file-input" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                <button onClick={handleAdd} style={{
                    background: 'transparent', color: 'var(--accent-cyan)',
                    border: '1px solid var(--accent-cyan)',
                    padding: '0.25rem 0.75rem', borderRadius: '4px',
                    fontSize: '0.8rem', cursor: 'pointer'
                }}>Add Employee</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                {employees.map(emp => (
                    <div key={emp.id} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{emp.name}</div>
                        <div onClick={() => handleDelete(emp.id)} style={{ color: '#ef4444', cursor: 'pointer' }}>🗑️</div>
                    </div>
                ))}
                {employees.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>No employees found.</div>}
            </div>
        </div>
    );
};

export default EmployeeManagement;
