import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

const ManageViolations = () => {
    const [violations, setViolations] = useState([]);

    const fetchViolations = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/violations`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
            const data = await res.json();
            setViolations(data);
        } catch (error) {
            console.error("Failed to fetch violations", error);
        }
    };

    useEffect(() => {
        fetchViolations();
        const interval = setInterval(fetchViolations, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card">
            <h2 className="title" style={{ marginBottom: '1.5rem' }}>Recent Safety Violations</h2>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Timestamp</th>
                            <th>Type</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {violations.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    No recent violations recorded.
                                </td>
                            </tr>
                        ) : (
                            violations.map((v) => (
                                <tr key={v.id}>
                                    <td>#{v.id}</td>
                                    <td style={{ color: '#94a3b8' }}>{v.timestamp}</td>
                                    <td>
                                        <span style={{
                                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                            color: '#f87171',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {v.type}
                                        </span>
                                    </td>
                                    <td>{v.description}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageViolations;
