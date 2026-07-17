import React, { useState } from 'react';
import { Search, Plus, Calendar, AlertTriangle, Trash2, Layers } from 'lucide-react';
import { apiService } from '../services/api';
import type { Transaction, TransactionFilters } from '../services/api';

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh: () => void;
  filters: TransactionFilters;
  setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>;
  onOpenPlaid: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onRefresh,
  filters,
  setFilters,
  onOpenPlaid
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCategory, setNewCategory] = useState('Uncategorized');
  const [newBank] = useState('Manual Entry');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['All', 'Dining', 'Grocery', 'Transportation', 'Rent', 'Bills', 'Shopping', 'Entertainment', 'Income', 'Medical', 'Uncategorized'];

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount) return;

    setIsSubmitting(true);
    try {
      await apiService.addTransaction({
        amount: parseFloat(newAmount),
        currency: 'INR',
        date: newDate,
        description: newDesc,
        category: newCategory,
        bankName: newBank,
        accountName: 'Wallet',
        anomalyStatus: 'NONE'
      });
      // Reset form
      setNewDesc('');
      setNewAmount('');
      setNewCategory('Uncategorized');
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      alert('Error creating transaction: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearDatabase = async () => {
    if (window.confirm('Are you sure you want to clear the entire database? This cannot be undone.')) {
      try {
        await apiService.clearTransactions();
        onRefresh();
      } catch (err) {
        alert('Error clearing transactions: ' + err);
      }
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Transaction History</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Showing {transactions.length} transactions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onOpenPlaid} className="btn btn-primary">
            <Plus size={16} /> Connect Bank Feed
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="btn btn-secondary"
          >
            <Plus size={16} /> Add Manual
          </button>
          <button 
            onClick={handleClearDatabase} 
            className="btn btn-danger btn-icon"
            title="Clear All Transactions"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expandable Manual Form */}
      {showAddForm && (
        <form 
          onSubmit={handleAddSubmit} 
          style={{ 
            background: 'rgba(15, 23, 42, 0.4)', 
            border: '1px solid var(--border-color)', 
            padding: '1.25rem', 
            borderRadius: '10px',
            animation: 'slideIn 0.25s ease-out' 
          }}
        >
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
            Add Transaction (AI will auto-categorize if left Uncategorized)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Description</label>
              <input
                type="text"
                placeholder="e.g. Starbucks MG Road"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="filter-input"
                style={{ width: '100%', padding: '0.4rem 0.6rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 380"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="filter-input"
                style={{ width: '100%', padding: '0.4rem 0.6rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="filter-input"
                style={{ width: '100%', padding: '0.4rem 0.6rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Initial Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="filter-input"
                style={{ width: '100%', padding: '0.4rem 0.6rem', background: '#0f172a' }}
              >
                {categories.slice(1).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Options */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by merchant or note..."
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="filter-input"
            style={{ width: '100%', paddingLeft: '2.25rem' }}
          />
        </div>

        <select
          value={filters.category || 'All'}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="filter-input"
          style={{ flex: '1 1 120px', background: '#0f172a' }}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c} Category</option>
          ))}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
          <input
            type="checkbox"
            id="anomalyOnly"
            checked={filters.anomalyOnly || false}
            onChange={(e) => setFilters(prev => ({ ...prev, anomalyOnly: e.target.checked }))}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor="anomalyOnly" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} /> Anomalies Only
          </label>
        </div>
      </div>

      {/* Transactions Grid/Table */}
      <div className="table-container">
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Layers size={40} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <p>No transactions found matching the current filters.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Try importing mock data or adding a transaction manually.</p>
          </div>
        ) : (
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Alerts</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="transaction-row">
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} style={{ opacity: 0.5 }} />
                      {t.date}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.description}</div>
                    {t.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{t.notes}</div>}
                  </td>
                  <td>
                    <span className={`category-badge ${t.category.toLowerCase()}`}>
                      {t.category}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div>{t.bankName || 'Wallet'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.accountName || 'Cash'}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: t.category === 'Income' ? 'var(--color-success)' : '#fff' }}>
                    {t.category === 'Income' ? '+' : '-'} ₹{t.amount?.toLocaleString()}
                  </td>
                  <td>
                    {t.anomalyStatus && t.anomalyStatus !== 'NONE' && (
                      <span 
                        className={`anomaly-tag ${t.anomalyStatus.toLowerCase()}`}
                        title={t.anomalyDescription}
                        style={{ cursor: 'help' }}
                      >
                        <AlertTriangle size={12} /> {t.anomalyStatus.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
