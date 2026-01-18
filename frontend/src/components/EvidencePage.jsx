import React, { useState } from 'react';
import Header from './Header';

import Footer from './Footer';

const EvidencePage = () => {
    const [selectedCase, setSelectedCase] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const [cases, setCases] = useState([
        { id: 'CASE-2025-001', title: 'Unauthorized Entry at Gate 3', date: '2025-01-18', time: '10:42 AM', type: 'Intrusion', status: 'Open', operator: 'Ritik', notes: 'Suspect identified as former employee.' },
        { id: 'CASE-2025-002', title: 'PPE Violation - Sector B', date: '2025-01-17', time: '02:15 PM', type: 'Safety', status: 'Closed', operator: 'John', notes: 'Warning issued to worker ID #445.' },
        { id: 'CASE-2025-003', title: 'Inventory Theft Attempt', date: '2025-01-15', time: '11:55 PM', type: 'Theft', status: 'Archived', operator: 'System', notes: 'Auto-flagged by motion detection.' },
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return '#ef4444';
            case 'Closed': return 'var(--success-color)';
            default: return 'var(--text-secondary)';
        }
    };

    const handleGenerateReport = () => {
        if (!selectedCase) return;
        const content = `EVIDENCE REPORT\n\nID: ${selectedCase.id}\nTitle: ${selectedCase.title}\nDate: ${selectedCase.date}\nTime: ${selectedCase.time}\nType: ${selectedCase.type}\nStatus: ${selectedCase.status}\nOperator: ${selectedCase.operator}\nNotes: ${selectedCase.notes}\n`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedCase.id}_Report.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDeleteCase = () => {
        if (window.confirm('Are you sure you want to delete this case?')) {
            setCases(cases.filter(c => c.id !== selectedCase.id));
            setSelectedCase(null);
            setIsPlaying(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)' }}>

                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '1.75rem', color: '#fff', fontWeight: 'bold' }}>Evidence Management</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Manage incident reports and video evidence</p>
                        </div>

                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {cases.map(c => (
                            <div key={c.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer', border: selectedCase?.id === c.id ? '1px solid var(--accent-cyan)' : 'none' }} onClick={() => { setSelectedCase(c); setIsPlaying(false); }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{c.id}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: getStatusColor(c.status) }}>{c.status}</span>
                                </div>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{c.title}</h3>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    <span>📅 {c.date}</span>
                                    <span>🕒 {c.time}</span>
                                </div>
                                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--accent-cyan)' }}>{c.type}</span> • <span style={{ color: '#94a3b8' }}>Op: {c.operator}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Case Detail Sidebar */}
                {selectedCase && (
                    <div style={{ width: '400px', background: 'rgba(15, 23, 42, 0.95)', borderLeft: '1px solid var(--panel-border)', padding: '2rem', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(10px)', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0, color: '#fff' }}>Case Details</h3>
                            <button onClick={() => setSelectedCase(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {/* Video Player Placeholder */}
                        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
                            {isPlaying ? (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
                                    <div style={{ textAlign: 'center', animation: 'pulse 2s infinite' }}>
                                        <div style={{ fontSize: '2rem' }}>▶️</div>
                                        <div style={{ color: 'var(--accent-cyan)', marginTop: '0.5rem' }}>Playing Clip...</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setIsPlaying(true)}>
                                    <div style={{ fontSize: '2rem' }}>▶️</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Play Evidence Clip</div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Title</label>
                            <div style={{ color: '#fff', fontWeight: 'bold' }}>{selectedCase.title}</div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Incident Notes</label>
                            <textarea
                                readOnly
                                value={selectedCase.notes}
                                style={{ width: '100%', height: '100px', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', borderRadius: '4px', color: '#fff', resize: 'none' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Date</label>
                                <div style={{ color: '#fff' }}>{selectedCase.date}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Status</label>
                                <div style={{ color: getStatusColor(selectedCase.status), fontWeight: 'bold' }}>{selectedCase.status}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button onClick={handleGenerateReport} style={{ padding: '1rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Download Report
                            </button>
                            <button onClick={handleDeleteCase} style={{ padding: '1rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Delete Evidence
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default EvidencePage;
