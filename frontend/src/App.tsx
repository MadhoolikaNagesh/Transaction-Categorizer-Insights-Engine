import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Landmark } from 'lucide-react';
import { apiService } from './services/api';
import type { Transaction, TransactionFilters } from './services/api';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { ChatAssistant } from './components/ChatAssistant';
import { PlaidSandbox } from './components/PlaidSandbox';
import { AccountMenu } from './components/AccountMenu';
import { AuthPage } from './components/AuthPage';

function App() {
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    category: 'All',
    anomalyOnly: false
  });
  const [isPlaidOpen, setIsPlaidOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [linkedBanks, setLinkedBanks] = useState<string[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);

  const handleAuthSuccess = (user: { id: number; username: string }) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    console.log("App: Logging out user:", currentUser);
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setTransactions([]);
    setLinkedBanks([]);
  };

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getTransactions(filters);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLinkedBanks = async () => {
    console.log("App: loadLinkedBanks - initiating fetch");
    setIsLoadingBanks(true);
    try {
      const banks = await apiService.getLinkedBanks();
      console.log("App: loadLinkedBanks - fetch success, linked banks:", banks);
      setLinkedBanks(banks);
    } catch (err) {
      console.error('App: loadLinkedBanks - fetch error:', err);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  // Reload transactions when filters or search inputs change, and user is logged in
  useEffect(() => {
    if (currentUser) {
      loadTransactions();
    }
  }, [filters, currentUser]);

  // Load linked banks on mount, and user is logged in
  useEffect(() => {
    if (currentUser) {
      loadLinkedBanks();
    }
  }, [currentUser]);

  const handlePlaidSuccess = async (bankName: string) => {
    try {
      setSyncMessage(`Syncing transactions with ${bankName}...`);
      await apiService.ingestMockFeed(bankName);
      setSyncMessage('Sync completed! AI has auto-categorized your bank feed.');
      setTimeout(() => setSyncMessage(null), 4000);
      loadTransactions();
      loadLinkedBanks(); // refresh linked banks list
    } catch (err) {
      alert('Error during bank sync: ' + err);
      setSyncMessage(null);
    }
  };

  const handleUnlinkBank = async (bankName: string) => {
    console.log(`App: handleUnlinkBank - initiating unlink for ${bankName}`);
    try {
      await apiService.unlinkBank(bankName);
      console.log(`App: handleUnlinkBank - unlink success for ${bankName}`);
      loadTransactions();
      loadLinkedBanks();
    } catch (err) {
      console.error(`App: handleUnlinkBank - unlink error for ${bankName}:`, err);
      throw err;
    }
  };

  const handleDeleteAccount = async () => {
    console.log("App: handleDeleteAccount - initiating data clearing");
    try {
      await apiService.clearTransactions();
      console.log("App: handleDeleteAccount - data clearing success");
      loadTransactions();
      setLinkedBanks([]);
    } catch (err) {
      console.error("App: handleDeleteAccount - clear error:", err);
      throw err;
    }
  };

  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="brand-name">Antigravity Finance AI</h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Transaction Categorizer &amp; Insights Engine</span>
          </div>
        </div>

        <div className="header-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
            <Landmark size={14} style={{ color: 'var(--color-accent)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>DB Connection: </span>
            <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>Active</span>
          </div>
          <button 
            onClick={loadTransactions} 
            className="btn btn-secondary btn-icon" 
            title="Refresh Feed"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <AccountMenu
            onOpenPlaid={() => setIsPlaidOpen(true)}
            onUnlinkBank={handleUnlinkBank}
            onDeleteAccount={handleDeleteAccount}
            linkedBanks={linkedBanks}
            isLoadingBanks={isLoadingBanks}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
        </div>
      </header>

      {/* Sync Status Banner */}
      {syncMessage && (
        <div 
          className="card" 
          style={{ 
            marginBottom: '1.5rem', 
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(99, 102, 241, 0.05))',
            borderColor: 'rgba(20, 184, 166, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem'
          }}
        >
          <Landmark size={20} style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{syncMessage}</span>
        </div>
      )}

      {/* Grid Dashboard Layout */}
      <main className="dashboard-grid">
        {/* Left Side: Stats and Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Dashboard transactions={transactions} />
          
          <TransactionList 
            transactions={transactions} 
            onRefresh={loadTransactions}
            filters={filters}
            setFilters={setFilters}
            onOpenPlaid={() => setIsPlaidOpen(true)}
          />
        </div>

        {/* Right Side: AI Assistant Chat */}
        <div>
          <ChatAssistant />
        </div>
      </main>

      {/* Plaid Link Modal */}
      <PlaidSandbox 
        isOpen={isPlaidOpen}
        onClose={() => setIsPlaidOpen(false)}
        onSuccess={handlePlaidSuccess}
      />
    </div>
  );
}

export default App;
