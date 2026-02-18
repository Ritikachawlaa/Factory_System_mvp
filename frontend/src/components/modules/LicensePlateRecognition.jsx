import React, { useEffect, useState } from 'react';
import ModulePage from './ModulePage';
import vehicleAnprApi from '../../api/vehicleAnpr.api';

const LicensePlateRecognition = () => {
    const [plates, setPlates] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await vehicleAnprApi.getDetections({ limit: 30 });
                const data = res?.data || res || [];
                setPlates(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error('Failed to fetch ANPR data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await vehicleAnprApi.searchPlate(searchQuery.trim());
            const data = res?.data || res || [];
            setPlates(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to search plate', e);
        }
    };

    const RightPanelContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Plate Search</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search plate..."
                        style={{
                            flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '4px',
                            fontFamily: 'monospace'
                        }}
                    />
                    <button onClick={handleSearch} style={{
                        padding: '0.5rem 0.75rem', background: 'var(--accent-cyan)',
                        color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                    }}>🔍</button>
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Scanned</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{plates.length}</span>
                </div>
            </div>
        </div>
    );

    return (
        <ModulePage title="Vehicle & ANPR" videoModules="vehicle_anpr" rightPanelContent={<RightPanelContent />}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Scanned Plates</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : plates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No plates scanned yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {plates.map((plate, idx) => (
                            <div key={plate.id || idx} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px'
                            }}>
                                <div>
                                    <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#fff' }}>
                                        {plate.plate || plate.plate_number || plate.message || '—'}
                                    </span>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        {plate.timestamp || plate.created_at || ''}
                                    </div>
                                </div>
                                <span style={{
                                    color: plate.status === 'Blocked' ? '#ef4444' : 'var(--success-color)',
                                    fontSize: '0.8rem', fontWeight: '500'
                                }}>{plate.status || 'Detected'}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ModulePage>
    );
};

export default LicensePlateRecognition;
