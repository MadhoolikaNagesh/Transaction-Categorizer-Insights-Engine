import React, { useState, useRef, useEffect } from 'react';
import {
  UserCircle2,
  Link2,
  Unlink,
  Trash2,
  ChevronDown,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';

interface AccountMenuProps {
  onOpenPlaid: () => void;
  onUnlinkBank: (bankName: string) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  linkedBanks: string[];
  isLoadingBanks: boolean;
}

type MenuView = 'main' | 'unlink' | 'delete-confirm';

export const AccountMenu: React.FC<AccountMenuProps> = ({
  onOpenPlaid,
  onUnlinkBank,
  onDeleteAccount,
  linkedBanks,
  isLoadingBanks,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<MenuView>('main');
  const [unlinkingBank, setUnlinkingBank] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Helper to log view transitions
  const handleSetView = (nextView: MenuView) => {
    console.log(`AccountMenu: view transition from '${view}' to '${nextView}'`);
    setView(nextView);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const closeMenu = () => {
    console.log("AccountMenu: closing menu");
    setIsOpen(false);
    setView('main');
    setFeedback(null);
  };

  const handleUnlink = async (bankName: string) => {
    console.log(`AccountMenu: handleUnlink initiated for bank: ${bankName}`);
    setUnlinkingBank(bankName);
    try {
      await onUnlinkBank(bankName);
      console.log(`AccountMenu: handleUnlink successfully unlinked bank: ${bankName}`);
      showFeedback('success', `${bankName} unlinked successfully.`);
      setView('main');
    } catch (err) {
      console.error(`AccountMenu: handleUnlink failed for bank: ${bankName}`, err);
      showFeedback('error', `Failed to unlink ${bankName}.`);
    } finally {
      setUnlinkingBank(null);
    }
  };

  const handleDeleteAccount = async () => {
    console.log("AccountMenu: handleDeleteAccount initiated");
    setIsDeleting(true);
    try {
      await onDeleteAccount();
      console.log("AccountMenu: handleDeleteAccount successfully cleared all account data");
      showFeedback('success', 'All account data deleted.');
      setView('main');
    } catch (err) {
      console.error("AccountMenu: handleDeleteAccount failed", err);
      showFeedback('error', 'Failed to delete account data.');
    } finally {
      setIsDeleting(false);
    }
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const bankColors: Record<string, string> = {
    'Chase Bank': '#115ec3',
    'Bank of America': '#dc143c',
    'Wells Fargo': '#d31115',
    'Citi Bank': '#004b87',
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Avatar Button */}
      <button
        id="account-menu-btn"
        onClick={() => {
          const nextState = !isOpen;
          console.log(`AccountMenu: toggle menu. Changing isOpen from ${isOpen} to ${nextState}`);
          setIsOpen(nextState);
          setView('main');
          setFeedback(null);
        }}
        className="btn btn-secondary"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.65rem',
          borderRadius: '50px',
          border: isOpen
            ? '1px solid rgba(99,102,241,0.6)'
            : '1px solid var(--border-color)',
          background: isOpen
            ? 'rgba(99,102,241,0.12)'
            : 'rgba(255,255,255,0.03)',
          transition: 'all 0.2s ease',
        }}
        title="Account"
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UserCircle2 size={18} color="#fff" />
        </div>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Account
        </span>
        <ChevronDown
          size={13}
          style={{
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          id="account-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '280px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'dropdownFadeIn 0.18s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.1rem 0.75rem',
              borderBottom: '1px solid var(--border-color)',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.07), rgba(20,184,166,0.04))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserCircle2 size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  My Account
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {linkedBanks.length} bank{linkedBanks.length !== 1 ? 's' : ''} linked
                </div>
              </div>
            </div>
            <button
              onClick={closeMenu}
              className="btn btn-secondary btn-icon"
              style={{ padding: '0.2rem', borderRadius: '50%', width: '24px', height: '24px' }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              style={{
                padding: '0.55rem 1rem',
                background:
                  feedback.type === 'success'
                    ? 'rgba(20,184,166,0.12)'
                    : 'rgba(239,68,68,0.12)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: feedback.type === 'success' ? 'var(--color-success)' : '#ef4444',
              }}
            >
              <CheckCircle2 size={13} />
              {feedback.message}
            </div>
          )}

          {/* ─── MAIN VIEW ─── */}
          {view === 'main' && (
            <div style={{ padding: '0.5rem' }}>
              {/* Link Account */}
              <button
                id="account-link-btn"
                onClick={() => {
                  closeMenu();
                  onOpenPlaid();
                }}
                className="account-menu-item"
              >
                <div className="account-menu-item-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                  <Link2 size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Link Account</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Connect a new bank via Plaid</div>
                </div>
              </button>

              {/* Unlink Account */}
              <button
                id="account-unlink-btn"
                onClick={() => handleSetView('unlink')}
                className="account-menu-item"
                disabled={linkedBanks.length === 0}
                style={{ opacity: linkedBanks.length === 0 ? 0.45 : 1 }}
              >
                <div className="account-menu-item-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                  <Unlink size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Unlink Account</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {linkedBanks.length === 0 ? 'No banks linked' : `Remove a linked bank`}
                  </div>
                </div>
              </button>

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.4rem 0' }} />

              {/* Delete Account */}
              <button
                id="account-delete-btn"
                onClick={() => handleSetView('delete-confirm')}
                className="account-menu-item account-menu-item-danger"
              >
                <div className="account-menu-item-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                  <Trash2 size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Delete Account Data</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Clear all transactions & feeds</div>
                </div>
              </button>
            </div>
          )}

          {/* ─── UNLINK VIEW ─── */}
          {view === 'unlink' && (
            <div style={{ padding: '0.75rem 0.85rem' }}>
              <button
                onClick={() => handleSetView('main')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  marginBottom: '0.75rem',
                  padding: 0,
                }}
              >
                ← Back
              </button>

              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Select bank to unlink
              </div>

              {isLoadingBanks ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
                </div>
              ) : linkedBanks.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.75rem 0' }}>
                  No banks currently linked.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {linkedBanks.map((bank) => (
                    <button
                      key={bank}
                      id={`unlink-${bank.replace(/\s+/g, '-').toLowerCase()}-btn`}
                      onClick={() => handleUnlink(bank)}
                      disabled={unlinkingBank === bank}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '9px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        transition: 'all 0.15s ease',
                        opacity: unlinkingBank === bank ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.4)';
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)';
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: bankColors[bank] ?? '#6366f1',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Building2 size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{bank}</span>
                        </div>
                      </div>
                      {unlinkingBank === bank ? (
                        <Loader2 size={13} style={{ animation: 'spin 1s linear infinite', color: '#ef4444' }} />
                      ) : (
                        <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 600 }}>REMOVE</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── DELETE CONFIRM VIEW ─── */}
          {view === 'delete-confirm' && (
            <div style={{ padding: '1rem 1.1rem' }}>
              <button
                onClick={() => handleSetView('main')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  marginBottom: '1rem',
                  padding: 0,
                }}
              >
                ← Back
              </button>

              <div
                style={{
                  textAlign: 'center',
                  padding: '0.5rem 0 1rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(239,68,68,0.12)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <AlertTriangle size={22} color="#ef4444" />
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Delete All Account Data?
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  This will permanently remove <strong>all transactions</strong> and linked bank feeds from the database. This action cannot be undone.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleSetView('main')}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.78rem' }}
                >
                  Cancel
                </button>
                <button
                  id="account-delete-confirm-btn"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="btn"
                  style={{
                    flex: 1.5,
                    fontSize: '0.78rem',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.6 : 1,
                  }}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      Yes, Delete All
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
