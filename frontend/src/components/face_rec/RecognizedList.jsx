import React, { useEffect, useState } from 'react';
import faceRecognitionApi from '../../api/faceRecognition.api';

const RecognizedList = ({ horizontal = false }) => {
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetections = async () => {
            try {
                const response = await faceRecognitionApi.getDetections({ limit: horizontal ? 6 : 50 });
                // handle both axios response style and plain array
                const data = response.data || response || [];
                setPeople(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching faces:", error);
            } finally {
                setLoading(false);
            }
        };

        const interval = setInterval(fetchDetections, 3000);
        fetchDetections();
        return () => clearInterval(interval);
    }, [horizontal]);

    if (horizontal) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {loading && people.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Scanning for personnel...</div>
                ) : people.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No recent recognition events.</div>
                ) : (
                    people.slice(0, 6).map((p, i) => {
                        const isUnknown = p.label?.toLowerCase()?.includes('unknown') || p.label?.startsWith('Visitor');

                        return (
                            <div key={i} className="glass-panel" style={{
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderLeft: `3px solid ${isUnknown ? '#ef4444' : 'var(--success-color)'}`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: isUnknown ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'
                                    }}>
                                        {p.label?.charAt(0) || '?'}
                                    </div>
                                    <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {isUnknown ? 'Unknown' : p.label}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {p.timestamp?.split(' ')?.pop()?.substring(0, 5) || 'Now'}
                                    </span>
                                    <span style={{ color: 'var(--accent-cyan)' }}>
                                        {p.confidence ? `${(p.confidence * 100).toFixed(0)}%` : '100%'}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1 }}>
            {people.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '1rem' }}>
                    No detections found.
                </div>
            ) : (
                people.map((p, i) => {
                    const isUnknown = p.label?.toLowerCase()?.includes('unknown') || p.label?.startsWith('Visitor');
                    return (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            paddingBottom: '0.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '6px',
                                    background: isUnknown ? '#475569' : '#059669',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: '0.8rem'
                                }}>
                                    {p.label?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                                        {isUnknown ? 'Unknown Face' : p.label}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {p.timestamp?.split(' ')?.pop() || ''}
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                {p.confidence ? `${(p.confidence * 100).toFixed(1)}%` : '-'}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default RecognizedList;
