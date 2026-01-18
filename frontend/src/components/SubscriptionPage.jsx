import React from 'react';
import Header from './Header';

import Footer from './Footer';

const SubscriptionPage = () => {
    // Mock Usage Data
    const usage = {
        plan: 'Enterprise Trial',
        cameras: { used: 12, limit: 20 },
        users: { used: 5, limit: 10 },
        aiModels: [
            { name: 'PPE Compliance', status: 'Active' },
            { name: 'Fire Detection', status: 'Active' },
            { name: 'Face Recognition', status: 'Active' },
            { name: 'Intrusion Detection', status: 'Active' }
        ]
    };

    const newArrivals = [
        { name: 'Weapon Detection', desc: 'Real-time firearm identification', price: '₹5,000/mo' },
        { name: 'Crowd Analytics', desc: 'Heatmaps & density estimation', price: '₹3,000/mo' }
    ];

    const CircularProgress = ({ value, max, label, color }) => {
        const percentage = (value / max) * 100;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: `conic-gradient(${color} ${percentage}%, rgba(255,255,255,0.1) 0)` }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '85px', height: '85px', borderRadius: '50%', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{value}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/ {max}</span>
                    </div>
                </div>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{label}</span>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)' }}>

                    {/* Top Section: Usage Dashboard */}
                    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>My Subscription</h2>
                                <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Manage your resources and active modules</p>
                            </div>
                            <div style={{ padding: '0.5rem 1rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', borderRadius: '50px', fontWeight: 'bold' }}>
                                {usage.plan}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '3rem' }}>
                            {/* Usage Stats */}
                            <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', alignItems: 'center' }}>
                                <CircularProgress value={usage.cameras.used} max={usage.cameras.limit} label="Cameras Used" color="#3b82f6" />
                                <CircularProgress value={usage.users.used} max={usage.users.limit} label="User Seats" color="#10b981" />
                            </div>

                            {/* Divider */}
                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

                            {/* Active AI Models */}
                            <div>
                                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem' }}>Purchased AI Models</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                                    {usage.aiModels.map((model, i) => (
                                        <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ color: 'var(--success-color)' }}>●</span>
                                            <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{model.name}</span>
                                        </div>
                                    ))}
                                    <div style={{ padding: '0.75rem', border: '1px dashed var(--text-secondary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        + Add Model
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Upgrade & Marketplace */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                        {/* Upgrade Options */}
                        <div>
                            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>Upgrade Plan</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {/* Yearly */}
                                <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--accent-cyan)', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: -10, right: 10, background: 'var(--accent-cyan)', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>BEST VALUE</div>
                                    <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Yearly Plan</h4>
                                    <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 'bold', marginBottom: '1rem' }}>₹50,000 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/year</span></div>
                                    <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
                                        <li>Unlimited Users</li>
                                        <li>30 Days Cloud Storage</li>
                                        <li>Priority Support</li>
                                    </ul>
                                    <button style={{ width: '100%', padding: '0.75rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Upgrade to Yearly</button>
                                </div>

                                {/* Lifetime */}
                                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Lifetime License</h4>
                                    <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 'bold', marginBottom: '1rem' }}>₹2.5 Lakh <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>one-time</span></div>
                                    <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
                                        <li>Perpetual Usage</li>
                                        <li>Local Storage Only</li>
                                        <li>1 Year Updates</li>
                                    </ul>
                                    <button style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer' }}>Buy Lifetime</button>
                                </div>
                            </div>
                        </div>

                        {/* New Arrivals */}
                        <div>
                            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>New AI Models</h3>
                            <div className="glass-panel" style={{ padding: '0' }}>
                                {newArrivals.map((item, i) => (
                                    <div key={i} style={{ padding: '1rem', borderBottom: index => i !== newArrivals.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>{item.name}</span>
                                            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.3rem', background: '#ec4899', color: '#fff', borderRadius: '3px' }}>NEW</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{item.desc}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>{item.price}</span>
                                            <button style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>Trial</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SubscriptionPage;
