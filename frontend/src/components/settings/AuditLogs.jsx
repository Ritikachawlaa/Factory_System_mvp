import React, { useState, useEffect } from 'react';
import analyticsApi from '../../api/analytics.api';

const AuditLogs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await analyticsApi.getAuditLogs();
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch audit logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const handleExport = () => {
        alert('Exporting Audit Logs to PDF...');
    };

    const filteredLogs = (logs || []).filter(log =>
        (log.user?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (log.action?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Loading logs...</div>;
    }

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Audit Logs</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Track all system activities and user actions</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', borderRadius: '4px', color: '#fff' }}
                    />
                    <button onClick={handleExport} style={{ padding: '0.5rem 1rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Export Logs
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Timestamp</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>User</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Action</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Target/Details</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{log.timestamp}</td>
                                <td style={{ padding: '1rem', color: '#fff' }}>{log.user}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                        background: log.action.includes('Delete') ? 'rgba(239,68,68,0.1)' : 'rgba(59, 130, 246, 0.1)',
                                        color: log.action.includes('Delete') ? '#ef4444' : '#3b82f6'
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#e2e8f0' }}>{log.target}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{log.ip}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;
