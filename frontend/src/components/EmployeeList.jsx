import React, { useEffect, useState } from 'react';

const EmployeeList = ({ refreshKey }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch('http://localhost:8000/employees');
                if (response.ok) {
                    const data = await response.json();
                    setEmployees(data);
                } else {
                    setError('Failed to fetch employees');
                }
            } catch (err) {
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [refreshKey]);

    if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>;
    if (error) return <div style={{ color: '#ef4444' }}>{error}</div>;

    if (employees.length === 0) {
        return <div style={{ color: 'var(--text-secondary)' }}>No employees registered yet.</div>;
    }

    return (
        <ul className="employee-list">
            {employees.map((emp, index) => (
                <li key={index} className="employee-item" style={{ alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {emp.image_url ? (
                            <img
                                src={emp.image_url}
                                alt={emp.name}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '1.2rem' }}>👤</span>
                            </div>
                        )}
                        <span>{emp.name}</span>
                    </div>

                    <span className={`badge ${emp.name.startsWith("Visitor_") ? 'visitor' : 'employee'}`}
                        style={{
                            backgroundColor: emp.name.startsWith("Visitor_") ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                            color: emp.name.startsWith("Visitor_") ? '#facc15' : '#4ade80'
                        }}
                    >
                        {emp.name.startsWith("Visitor_") ? 'Visitor' : 'Employee'}
                    </span>
                </li>
            ))}
        </ul>
    );
};

export default EmployeeList;
