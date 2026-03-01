import React, { useState, useEffect, useRef } from 'react';
import analyticsApi from '../../api/analytics.api';

const AuditLogs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef(null);

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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExportExcel = () => {
        const headers = ['Timestamp', 'User', 'Action', 'Target/Details', 'IP Address'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                `"${log.timestamp}"`,
                `"${log.user}"`,
                `"${log.action}"`,
                `"${log.target}"`,
                `"${log.ip}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `CAMAI_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    const handleExportPDF = () => {
        // Simple trick: use window.print(). 
        // We'll rely on the user's browser "Print to PDF" capability.
        // We can add print-specific styles here if needed.
        window.print();
        setShowExportMenu(false);
    };

    const filteredLogs = (logs || []).filter(log =>
        (log.user?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (log.action?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Loading logs...</div>;
    }

    return (
        <div className="glass-panel audit-logs-container" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <style>
                {`
                @media print {
                    nav, .header, .sidebar, .sidebar-container, .export-controls, footer, .header-container { display: none !important; }
                    .audit-logs-container { background: white !important; color: black !important; padding: 0 !important; width: 100% !important; height: auto !important; position: absolute !important; top: 0 !important; left: 0 !important; }
                    .audit-logs-container .glass-panel { background: white !important; border: none !important; }
                    .audit-logs-container th, .audit-logs-container td { color: black !important; border-bottom: 1px solid #ddd !important; padding: 8px !important; }
                    .audit-logs-container h3 { color: black !important; }
                    .audit-logs-container p { color: #666 !important; }
                    table { border-collapse: collapse !important; width: 100% !important; }
                }
                `}
            </style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }} className="export-controls">
                <div>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Audit Logs</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Track all system activities and user actions</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', borderRadius: '4px', color: '#fff' }}
                    />
                    <div ref={exportMenuRef}>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            style={{ padding: '0.5rem 1rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Export Logs ↓
                        </button>

                        {showExportMenu && (
                            <div style={{
                                position: 'absolute', top: '110%', right: 0, width: '150px',
                                background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--panel-border)',
                                borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(10px)', padding: '0.5rem'
                            }}>
                                <button
                                    onClick={handleExportPDF}
                                    style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: 'none', color: '#fff', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '0.9rem' }}
                                    onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                                >
                                    📄 Export as PDF
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: 'none', color: '#fff', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '0.9rem' }}
                                    onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                                >
                                    📊 Export as Excel (CSV)
                                </button>
                            </div>
                        )}
                    </div>
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
