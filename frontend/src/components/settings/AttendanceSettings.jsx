import React, { useRef } from 'react';

const AttendanceSettings = () => {
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            alert(`File "${file.name}" uploaded successfully! (Mock Action)`);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, fontWeight: '500' }}>Attendance Data</h3>
            </div>

            {/* Import Section */}
            <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Import Attendance</h4>
                <div
                    onClick={() => fileInputRef.current.click()}
                    style={{
                        border: '2px dashed var(--panel-border)', borderRadius: '8px',
                        padding: '2rem', textAlign: 'center', cursor: 'pointer',
                        background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".csv,.xlsx"
                        onChange={handleFileUpload}
                    />
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📂</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Click to Upload CSV/Excel</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>or drag and drop files here</div>
                </div>
            </div>

            {/* Export Section */}
            <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Export Reports</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                        <div>
                            <div style={{ color: '#fff', fontSize: '0.9rem' }}>Daily Attendance Log</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Detailed entry/exit times for today</div>
                        </div>
                        <button style={{
                            padding: '0.5rem 1rem', background: 'var(--accent-cyan)', color: '#000',
                            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold'
                        }} onClick={() => alert('Exporting Daily Log...')}>Export</button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                        <div>
                            <div style={{ color: '#fff', fontSize: '0.9rem' }}>Monthly Summary</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Aggregated hours and absence report</div>
                        </div>
                        <button style={{
                            padding: '0.5rem 1rem', background: 'transparent', color: 'var(--accent-cyan)',
                            border: '1px solid var(--accent-cyan)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'
                        }} onClick={() => alert('Exporting Monthly Summary...')}>Export</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceSettings;
