import React from 'react';

const BillingPanel = () => {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{
                color: '#fff', fontSize: '1rem',
                marginBottom: '1rem', fontWeight: '500'
            }}>Billing & Subscription</h3>

            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Current Plan</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>Premium Enterprise</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Next Billing: Nov 26, 2023</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>Cloud Storage</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>1.2 TB Used / 5 TB Total</div>
                        <div style={{ width: '100%', height: '4px', background: '#334155', borderRadius: '2px', marginTop: '0.5rem' }}>
                            <div style={{ width: '24%', height: '100%', background: 'var(--accent-cyan)', borderRadius: '2px' }}></div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'transparent',
                        border: '1px solid var(--accent-cyan)',
                        color: 'var(--accent-cyan)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}>
                        Upgrade Plan
                    </button>
                    <button style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: '#ef4444',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillingPanel;
