import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const PrivacyPolicy = () => {
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
                    <h1 style={{ color: '#fff', marginBottom: '2rem', fontSize: '2.5rem', textAlign: 'center' }}>Privacy Policy</h1>

                    <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1rem' }}>
                        <p style={{ marginBottom: '1.5rem' }}>Last updated: January 18, 2026</p>

                        <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>1. Introduction</h3>
                        <p>Welcome to Vision AI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>

                        <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>2. Data We Collect</h3>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                        <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                            <li>Identity Data limits to first name, maiden name, last name, username or similar identifier.</li>
                            <li>Contact Data includes billing address, delivery address, email address and telephone numbers.</li>
                            <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version.</li>
                        </ul>

                        <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>3. How We Use Your Data</h3>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        </ul>

                        <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>4. Data Security</h3>
                        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>

                        <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>5. Contact Us</h3>
                        <p>If you have any questions about this privacy policy or our privacy practices, please contact us.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
