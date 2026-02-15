import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { AuditLogService } from '../services/auditLogService';

const AuditLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        const data = await AuditLogService.getLogs();
        setLogs(data);
        setLoading(false);
    };

    const filteredLogs = logs.filter(l =>
        l.user.toLowerCase().includes(filter.toLowerCase()) ||
        l.action.toLowerCase().includes(filter.toLowerCase()) ||
        l.detail.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <Sidebar />
                <div style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                    background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '500', margin: 0 }}>System Audit Logs</h2>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Track all system actions and configuration changes.</p>
                        </div>
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', width: '250px' }}
                        />
                    </div>

                    <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--panel-border)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TIMESTAMP</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>USER</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ROLE</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ACTION</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>DETAILS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Logs...</td></tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No logs found.</td></tr>
                                ) : (
                                    filteredLogs.map(log => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{log.user}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase',
                                                    background: log.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                    color: log.role === 'admin' ? '#ef4444' : '#3b82f6'
                                                }}>
                                                    {log.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{log.action}</td>
                                            <td style={{ padding: '1rem', color: '#e2e8f0' }}>{log.detail}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AuditLogsPage;
