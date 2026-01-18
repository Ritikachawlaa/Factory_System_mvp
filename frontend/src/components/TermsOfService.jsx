import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const TermsOfService = () => {
    const navigate = useNavigate();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
            <Header />
            <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem', position: 'relative' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '1.5rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: '#fff',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <h1 style={{ color: '#fff', marginBottom: '2rem', fontSize: '2.5rem', textAlign: 'center' }}>Terms of Service</h1>

                    <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1rem' }}>
                        <p style={{ marginBottom: '1.5rem' }}>Last updated: January 18, 2026</p>

                        <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>1. Agreement to Terms</h3>
                        <p>By accessing our website and using our AI surveillance services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.</p>

                        <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>2. Use License</h3>
                        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Vision AI's website for personal, non-commercial transitory viewing only.</p>

                        <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>3. Service Availability</h3>
                        <p>We strive to provide uninterrupted service but cannot guarantee that our system will be available at all times. We reserve the right to suspend or terminate services for maintenance or updates.</p>

                        <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>4. User Responsibilities</h3>
                        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.</p>

                        <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>5. Limitation of Liability</h3>
                        <p>In no event shall Vision AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Vision AI's website.</p>

                        <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>6. Governing Law</h3>
                        <p>These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfService;
