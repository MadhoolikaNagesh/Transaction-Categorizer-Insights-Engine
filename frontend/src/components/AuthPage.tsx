import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, Cpu, Wallet, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface AuthPageProps {
  onAuthSuccess: (user: { id: number; username: string }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const user = await apiService.login(username, password);
        console.log('Auth: Logged in user:', user);
        onAuthSuccess(user);
      } else {
        const res = await apiService.register(username, password);
        console.log('Auth: Registered user:', res);
        // Automatically login after registration
        const user = await apiService.login(username, password);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Decorative Blobs */}
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />

      <div style={styles.card}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoContainer}>
            <Cpu size={28} style={styles.logoIcon} />
          </div>
          <h1 style={styles.brandTitle}>Antigravity Finance AI</h1>
          <p style={styles.brandSubtitle}>Transaction Categorizer & Insights Engine</p>
        </div>

        {/* Mode Selector Tab */}
        <div style={styles.tabs}>
          <button 
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{ ...styles.tab, ...(isLogin ? styles.activeTab : {}) }}
          >
            Log In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{ ...styles.tab, ...(!isLogin ? styles.activeTab : {}) }}
          >
            Register
          </button>
        </div>

        {/* Auth Error Banner */}
        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={16} style={{ marginRight: '0.5rem', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                placeholder="Enter your password (min. 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={styles.submitBtn} 
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                {isLogin ? 'Sign In to Dashboard' : 'Create Account'}
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        {/* Features Footer */}
        <div style={styles.footer}>
          <div style={styles.featureItem}>
            <ShieldCheck size={14} style={styles.featureIcon} />
            <span>Encrypted Ledger</span>
          </div>
          <div style={styles.featureItem}>
            <Wallet size={14} style={styles.featureIcon} />
            <span>Multi-Bank Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    background: 'radial-gradient(circle at top right, #111827, #030712)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    color: '#f3f4f6',
    zIndex: 9999,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    opacity: 0.14,
    zIndex: 1,
    pointerEvents: 'none',
  },
  blob1: {
    top: '20%',
    left: '15%',
    width: '350px',
    height: '350px',
    background: '#6366f1',
  },
  blob2: {
    bottom: '20%',
    right: '15%',
    width: '400px',
    height: '400px',
    background: '#14b8a6',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '430px',
    padding: '2.5rem 2rem',
    background: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
    animation: 'authFadeIn 0.5s ease',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoContainer: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(20,184,166,0.15))',
    padding: '0.85rem',
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  logoIcon: {
    color: '#818cf8',
  },
  brandTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
    marginBottom: '0.35rem',
    background: 'linear-gradient(to right, #ffffff, #9ca3af)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  brandSubtitle: {
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  tabs: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '0.25rem',
    marginBottom: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  tab: {
    flex: 1,
    padding: '0.6rem 0',
    background: 'none',
    border: 'none',
    borderRadius: '10px',
    color: '#9ca3af',
    fontSize: '0.88rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeTab: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    marginBottom: '1.25rem',
    fontSize: '0.82rem',
    color: '#ef4444',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#9ca3af',
    letterSpacing: '0.025em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#6b7280',
  },
  input: {
    width: '100%',
    padding: '0.85rem 1rem 0.85rem 2.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    padding: '0.9rem',
    cursor: 'pointer',
    fontSize: '0.92rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    marginTop: '0.5rem',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    marginTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    paddingTop: '1.25rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.74rem',
    color: '#6b7280',
  },
  featureIcon: {
    color: '#818cf8',
  },
};
