import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Building, ArrowRight, Loader2 } from 'lucide-react';

interface PlaidSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bankName: string) => void;
}

export const PlaidSandbox: React.FC<PlaidSandboxProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  if (!isOpen) return null;

  const banks = [
    { name: 'Chase Bank', color: '#115ec3' },
    { name: 'Bank of America', color: '#dc143c' },
    { name: 'Wells Fargo', color: '#d31115' },
    { name: 'Citi Bank', color: '#004b87' }
  ];

  const handleSelectBank = (bankName: string) => {
    setSelectedBank(bankName);
    setStep(2);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setStep(3);
    
    // Simulate Plaid MFA/Authentication Connection
    setTimeout(() => {
      onSuccess(selectedBank);
      onClose();
      // Reset state
      setStep(1);
      setSelectedBank('');
      setUsername('');
      setPassword('');
    }, 3000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px', padding: '1.5rem' }}>
        <button 
          onClick={onClose} 
          className="btn btn-secondary btn-icon" 
          style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem', borderRadius: '50%' }}
        >
          <X size={18} />
        </button>

        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', width: '56px', height: '56px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <ShieldCheck size={28} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Link Bank Account</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Secured by Plaid Sandbox protocol</p>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
              Select a mock financial institution to simulate syncing your transaction data.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {banks.map((bank) => (
                <button
                  key={bank.name}
                  onClick={() => handleSelectBank(bank.name)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', padding: '0.9rem 1rem', width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: bank.color }}></div>
                    <span>{bank.name}</span>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <Lock size={12} />
              <span>End-to-end 256-bit encryption</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--color-accent)', width: '48px', height: '48px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Building size={22} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Login to {selectedBank}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Plaid Sandbox Credentials Required</p>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.75rem', color: 'var(--color-warning)' }}>
              <strong>Sandbox Hint:</strong> Enter username <code>user_good</code> and password <code>mfa_device</code> to authorize.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 500 }}>Username</label>
                <input
                  type="text"
                  placeholder="e.g. user_good"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="filter-input"
                  style={{ width: '100%', padding: '0.75rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 500 }}>Password</label>
                <input
                  type="password"
                  placeholder="e.g. mfa_device"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="filter-input"
                  style={{ width: '100%', padding: '0.75rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 2 }}
              >
                Authorize Link
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <Loader2 className="spinning" size={48} style={{ color: 'var(--color-primary)', animation: 'spin 1.5s linear infinite' }} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Connecting to {selectedBank}...</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Retrieving accounts and authorization tokens. Auto-syncing bank feed transactions into your database.
            </p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
};
