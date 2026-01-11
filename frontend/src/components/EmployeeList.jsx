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
                <li key={index} className="employee-item">
                    <span>{emp.name}</span>
                    <span className="badge">Active</span>
                </li>
            ))}
        </ul>
    );
};

export default EmployeeList;
