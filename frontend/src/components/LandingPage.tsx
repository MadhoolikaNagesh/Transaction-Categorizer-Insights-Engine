import React from 'react';
import { Sparkles, Cpu, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div style={styles.container}>
      {/* Background Decorative Grid and Blobs */}
      <div style={styles.gridOverlay} />
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />

      {/* Navigation Header */}
      <header style={styles.header}>
        <div style={styles.logoSection}>
          <div style={styles.logoIconContainer}>
            <Sparkles size={20} style={styles.logoIcon} />
          </div>
          <span style={styles.logoText}>FinVertex</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#tech" style={styles.navLink}>Technology</a>
          <button onClick={onGetStarted} style={styles.navBtn}>Sign In</button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.badge}>
          <Cpu size={12} style={{ marginRight: '0.5rem', color: '#14b8a6' }} />
          <span>Autonomous Finance Engine v1.0</span>
        </div>
        
        <h1 style={styles.heroTitle}>
          Financial Intelligence <br />
          <span style={styles.gradientText}>Redefined by AI</span>
        </h1>
        
        <p style={styles.heroSubtitle}>
          Connect feeds, automatically categorize expenses, isolate anomalies, and talk to your financial ledger in plain English. Powered by advanced neural categorization and Spring AI.
        </p>

        <div style={styles.ctaGroup}>
          <button onClick={onGetStarted} style={styles.primaryCta}>
            Get Started Free
            <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </button>
          <a href="#features" style={styles.secondaryCta}>
            Learn More
          </a>
        </div>

        {/* Live System Preview Frame */}
        <div style={styles.previewContainer}>
          <div style={styles.previewHeader}>
            <div style={styles.dots}>
              <span style={{ ...styles.dot, backgroundColor: '#ef4444' }} />
              <span style={{ ...styles.dot, backgroundColor: '#eab308' }} />
              <span style={{ ...styles.dot, backgroundColor: '#22c55e' }} />
            </div>
            <div style={styles.previewUrl}>finvertex.ai/dashboard</div>
          </div>
          <div style={styles.previewBody}>
            <div style={styles.previewGrid}>
              <div style={styles.previewCard}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Auto-Categorized</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0' }}>₹1,20,000.00</div>
                <span style={styles.pillGreen}>100% Sorted</span>
              </div>
              <div style={styles.previewCard}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Anomalies Flagged</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0', color: '#ef4444' }}>6 Alerts</div>
                <span style={styles.pillRed}>High Severity</span>
              </div>
            </div>
            
            {/* Live Feed Row */}
            <div style={styles.feedRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ ...styles.colorIndicator, backgroundColor: '#6366f1' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Starbucks Coffee</span>
              </div>
              <span style={styles.pillBlue}>Dining</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>₹380.00</span>
              <span style={styles.pillWarning}>Duplicate Suspect</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Engineered for Autonomous Wealth Tracking</h2>
          <p style={styles.sectionSubtitle}>Say goodbye to manual expense tracking. Our AI works in the background to analyze every line of your financial statement.</p>
        </div>

        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={{ ...styles.featureIconContainer, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Cpu size={24} />
            </div>
            <h3 style={styles.featureTitle}>Autonomous Categorization</h3>
            <p style={styles.featureDesc}>Neural-inference engines parse raw transaction strings and assign appropriate transaction tags dynamically.</p>
          </div>

          <div style={styles.featureCard}>
            <div style={{ ...styles.featureIconContainer, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <Activity size={24} />
            </div>
            <h3 style={styles.featureTitle}>Anomaly Safeguard</h3>
            <p style={styles.featureDesc}>Instantly flags double-billing, massive spending spikes, or transaction activities outside normal parameters.</p>
          </div>

          <div style={styles.featureCard}>
            <div style={{ ...styles.featureIconContainer, background: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6' }}>
              <Sparkles size={24} />
            </div>
            <h3 style={styles.featureTitle}>Conversational Finance</h3>
            <p style={styles.featureDesc}>Ask our financial chatbot complex queries about your balance, trends, and budget in plain conversational English.</p>
          </div>

          <div style={styles.featureCard}>
            <div style={{ ...styles.featureIconContainer, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={styles.featureTitle}>Multi-User Ledger Isolation</h3>
            <p style={styles.featureDesc}>Persist credentials and statements securely, ensuring complete data partitions and transaction isolation between profiles.</p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Built on a High-Performance Tech Stack</h2>
          <p style={styles.sectionSubtitle}>We leverage modern cloud computing and enterprise-grade microservice architecture.</p>
        </div>

        <div style={styles.techStack}>
          <div style={styles.techCard}>
            <span style={styles.techLabel}>Frontend</span>
            <div style={styles.techName}>React + Vite</div>
          </div>
          <div style={styles.techCard}>
            <span style={styles.techLabel}>Backend Core</span>
            <div style={styles.techName}>Spring Boot 3 + Java 21</div>
          </div>
          <div style={styles.techCard}>
            <span style={styles.techLabel}>Cognitive Intelligence</span>
            <div style={styles.techName}>Spring AI + OpenAI</div>
          </div>
          <div style={styles.techCard}>
            <span style={styles.techLabel}>Cloud Database</span>
            <div style={styles.techName}>Aiven PostgreSQL</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} FinVertex. Secured by AES-256 bank-grade protocol encryption.
        </p>
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#030712',
    color: '#f3f4f6',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    position: 'relative',
    overflowX: 'hidden',
    paddingBottom: '4rem',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    pointerEvents: 'none',
    zIndex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(100px)',
    opacity: 0.12,
    zIndex: 1,
    pointerEvents: 'none',
  },
  blob1: {
    top: '10%',
    right: '5%',
    width: '500px',
    height: '500px',
    background: '#6366f1',
  },
  blob2: {
    bottom: '20%',
    left: '10%',
    width: '450px',
    height: '450px',
    background: '#14b8a6',
  },
  header: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 3rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  logoIconContainer: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(20,184,166,0.2))',
    padding: '0.5rem',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  logoIcon: {
    color: '#818cf8',
  },
  logoText: {
    fontSize: '1.15rem',
    fontWeight: 700,
    background: 'linear-gradient(to right, #fff, #d1d5db)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2.5rem',
  },
  navLink: {
    color: '#9ca3af',
    fontSize: '0.9rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  navBtn: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#fff',
    padding: '0.5rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  heroSection: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '800px',
    margin: '4rem auto 6rem',
    textAlign: 'center',
    padding: '0 2rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(20, 184, 166, 0.08)',
    border: '1px solid rgba(20, 184, 166, 0.15)',
    borderRadius: '9999px',
    padding: '0.35rem 1rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#14b8a6',
    marginBottom: '2rem',
  },
  heroTitle: {
    fontSize: '3.75rem',
    fontWeight: 800,
    lineHeight: '1.15',
    letterSpacing: '-0.03em',
    marginBottom: '1.5rem',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #818cf8, #14b8a6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: '#9ca3af',
    lineHeight: '1.6',
    marginBottom: '2.5rem',
    padding: '0 1rem',
  },
  ctaGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '5rem',
  },
  primaryCta: {
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    padding: '0.9rem 1.75rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  secondaryCta: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    color: '#d1d5db',
    padding: '0.9rem 1.75rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  previewContainer: {
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    textAlign: 'left',
  },
  previewHeader: {
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
  },
  dots: {
    display: 'flex',
    gap: '0.35rem',
  },
  dot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
  },
  previewUrl: {
    fontSize: '0.72rem',
    color: '#6b7280',
    margin: '0 auto',
    paddingRight: '2.5rem',
  },
  previewBody: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  previewCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
  },
  pillGreen: {
    fontSize: '0.68rem',
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#4ade80',
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px',
    fontWeight: 600,
  },
  pillRed: {
    fontSize: '0.68rem',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#f87171',
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px',
    fontWeight: 600,
  },
  pillBlue: {
    fontSize: '0.68rem',
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#818cf8',
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px',
    fontWeight: 600,
  },
  pillWarning: {
    fontSize: '0.68rem',
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#fbbf24',
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px',
    fontWeight: 600,
  },
  feedRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
  },
  colorIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  section: {
    maxWidth: '1200px',
    margin: '0 auto 8rem',
    padding: '0 2rem',
    position: 'relative',
    zIndex: 10,
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: 700,
    marginBottom: '1rem',
    letterSpacing: '-0.02em',
  },
  sectionSubtitle: {
    fontSize: '1rem',
    color: '#9ca3af',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.5rem',
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '18px',
    padding: '2rem 1.75rem',
    transition: 'all 0.3s ease',
  },
  featureIconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  featureTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
  },
  featureDesc: {
    fontSize: '0.88rem',
    color: '#9ca3af',
    lineHeight: '1.6',
  },
  techStack: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
  },
  techCard: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '14px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  techLabel: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    color: '#6b7280',
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  techName: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#ffffff',
  },
  footer: {
    maxWidth: '1200px',
    margin: '4rem auto 0',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    padding: '2rem 2rem 0',
    textAlign: 'center',
  },
};
