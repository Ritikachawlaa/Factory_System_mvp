import React, { useState, useEffect } from 'react';
import settingsApi from '../../api/settings.api';

const CriticalAlertsSettings = () => {
    const [criticalModules, setCriticalModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const availableModules = [
        { key: 'ppe-compliance', label: 'PPE Compliance' },
        { key: 'intrusion-detection', label: 'Intrusion Detection' },
        { key: 'human-detection', label: 'Human Detection' },
        { key: 'face-detection', label: 'Face Detection' },
        { key: 'object-detection', label: 'Object Detection' },
        { key: 'crowd-density', label: 'Crowd Density' },
        { key: 'auto-tracking', label: 'Auto Tracking' },
        { key: 'labour-counting', label: 'Labour Counting' },
        { key: 'people-count', label: 'People Count' },
        { key: 'entry-exit', label: 'Entry/Exit Count' },
        { key: 'loitering-detection', label: 'Loitering Detection' },
        { key: 'line-crossing', label: 'Line Crossing' },
    ];

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await settingsApi.getSetting('critical_modules');
                if (res && res.value) {
                    setCriticalModules(JSON.parse(res.value));
                }
            } catch (e) {
                console.error("Failed to fetch critical modules setting", e);
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const toggleModule = (key) => {
        setCriticalModules(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsApi.updateSetting('critical_modules', criticalModules);
            alert("Settings saved successfully!");
        } catch (e) {
            alert("Failed to save settings: " + (e.response?.data?.detail || e.message));
        }
        setSaving(false);
    };

    if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '1rem' }}>Loading Configuration...</div>;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, fontWeight: '500' }}>Critical Alerts Configuration</h3>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        background: 'var(--accent-cyan)', color: '#000', border: 'none',
                        padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '0.85rem',
                        fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1
                    }}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Select which AI modules will trigger alerts in the <b>Critical Violations</b> section of the Alerts page.
                Other modules will appear in the Activity Feed.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.75rem',
                marginTop: '0.5rem'
            }}>
                {availableModules.map(module => (
                    <div
                        key={module.key}
                        onClick={() => toggleModule(module.key)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            background: criticalModules.includes(module.key) ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${criticalModules.includes(module.key) ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: '2px solid var(--accent-cyan)',
                            background: criticalModules.includes(module.key) ? 'var(--accent-cyan)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#000',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
                            {criticalModules.includes(module.key) && '✓'}
                        </div>
                        <span style={{
                            fontSize: '0.9rem',
                            color: criticalModules.includes(module.key) ? '#fff' : 'var(--text-secondary)',
                            fontWeight: criticalModules.includes(module.key) ? '600' : '400'
                        }}>{module.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CriticalAlertsSettings;
