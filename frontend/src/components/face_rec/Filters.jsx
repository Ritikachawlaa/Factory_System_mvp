import React from 'react';

const Filters = () => {
    const filters = [
        'Known Faces', 'Unknown Faces'
    ];

    return (
        <div className="glass-panel" style={{ padding: '1rem', height: '100%' }}>
            <h3 style={{
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                letterSpacing: '1px'
            }}>Filters</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {filters.map(filter => (
                    <label key={filter} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.85rem', color: 'var(--text-primary)',
                        cursor: 'pointer'
                    }}>
                        <input type="checkbox" style={{ accentColor: 'var(--accent-cyan)' }} />
                        {filter}
                    </label>
                ))}
            </div>
        </div>
    );
};

export default Filters;
