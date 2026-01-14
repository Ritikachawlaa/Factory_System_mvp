import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';
import API_BASE_URL from '../../config';

const PPECompliance = () => {
    const [violations, setViolations] = useState([]);
    const [complianceRate, setComplianceRate] = useState(100);

    useEffect(() => {
        const fetchViolations = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/violations`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                if (response.ok) {
                    setViolations(await response.json());
                }
            } catch (e) { console.error(e); }
        };

        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/stats/compliance`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                if (response.ok) {
                    const data = await response.json();
                    setComplianceRate(data.compliance_rate);
                }
            } catch (e) { console.error(e); }
        };

        const interval = setInterval(() => {
            fetchViolations();
            fetchStats();
        }, 3000);

        fetchViolations();
        fetchStats();

        return () => clearInterval(interval);
    }, []);

    return (
        <ModulePage title="PPE Compliance Monitoring" videoModules="ppe">
            {/* Filters removed as per user request */}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Violations Log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {violations.length === 0 ? (
                            <div style={{ color: 'var(--text-secondary)' }}>No recent violations.</div>
                        ) : (
                            violations.map((v) => (
                                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                                    <span>{v.type} ({v.description})</span>
                                    <span style={{ opacity: 0.8 }}>{v.timestamp.split(' ')[1]}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Compliance Rate</h3>
                    <div style={{ fontSize: '3rem', color: complianceRate < 80 ? '#ef4444' : 'var(--success-color)', fontWeight: 'bold' }}>{complianceRate}%</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Daily Average</div>
                </div>
            </div>
        </ModulePage>
    );
};

export default PPECompliance;
