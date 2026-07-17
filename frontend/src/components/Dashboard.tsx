import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Building } from 'lucide-react';
import type { Transaction } from '../services/api';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  // Calculate aggregate metrics
  const expenses = transactions.filter(t => t.category !== 'Income');
  const totalExpense = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const incomeTrans = transactions.filter(t => t.category === 'Income');
  const totalIncome = incomeTrans.reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const anomalies = transactions.filter(t => t.anomalyStatus && t.anomalyStatus !== 'NONE');
  
  const uniqueBanks = Array.from(new Set(transactions.map(t => t.bankName).filter(Boolean)));

  // Calculate category aggregates
  const categoryMap: Record<string, number> = {};
  expenses.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + (t.amount || 0);
  });

  const sortedCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Stat Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon primary">
            <TrendingDown size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Expenses</span>
            <span className="stat-value">₹{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <TrendingUp size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Income</span>
            <span className="stat-value">₹{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Anomalies</span>
            <span className="stat-value" style={{ color: anomalies.length > 0 ? 'var(--color-danger)' : '#fff' }}>
              {anomalies.length} Flagged
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon accent">
            <Building size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Linked Feeds</span>
            <span className="stat-value">{uniqueBanks.length} Banks</span>
          </div>
        </div>
      </div>

      {/* Critical Anomalies Alerts */}
      {anomalies.length > 0 && (
        <div 
          className="card" 
          style={{ 
            borderColor: 'rgba(244, 63, 94, 0.3)', 
            background: 'rgba(244, 63, 94, 0.05)',
            borderLeft: '4px solid var(--color-danger)'
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--color-danger)' }}>
            <AlertTriangle size={18} /> Financial Anomaly Alerts Detected
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {anomalies.map(t => (
              <div 
                key={t.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.5rem 0.75rem', 
                  background: 'rgba(15, 23, 42, 0.4)', 
                  border: '1px solid rgba(244, 63, 94, 0.1)',
                  borderRadius: '6px',
                  fontSize: '0.85rem' 
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{t.description}</span> - 
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>{t.anomalyDescription}</span>
                </div>
                <span style={{ fontWeight: 800, color: 'var(--color-danger)', whiteSpace: 'nowrap' }}>
                  ₹{t.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Category Breakdown and AI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        
        {/* Category Breakdown (Custom visual graph cards) */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Spending by Category</h3>
          
          {sortedCategories.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
              No expense data available. Sync your accounts to populate categories.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sortedCategories.map(([category, amount]) => {
                const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                return (
                  <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>{category}</span>
                      <span style={{ fontWeight: 700 }}>
                        ₹{amount.toLocaleString()} 
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.35rem' }}>
                          ({percentage.toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        className={`bar-${category.toLowerCase()}`}
                        style={{ 
                          height: '100%', 
                          width: `${percentage}%`,
                          borderRadius: '4px',
                          background: getCategoryColor(category)
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Budget Coach Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(20, 184, 166, 0.05))' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-accent)' }}>
            📊 Antigravity AI Spending Analysis
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
            Based on your active transactions and bank feeds, the Antigravity Finance assistant can analyze anomalous patterns or recommend savings strategies.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem', color: 'var(--text-primary)' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <strong>Duplicate charges detected:</strong> {anomalies.filter(a => a.anomalyStatus === 'DUPLICATE_SUSPECT').length} items found. Ask the chatbot: <em>\"How do I resolve duplicate charges?\"</em> to inspect.
            </div>
            
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <strong>Dining Spike:</strong> You had a high Dining charge of ₹8,500 recently. That is higher than your regular swiggy/restaurant runs.
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <strong>Budget tip:</strong> Your Bills and Utilities category is stable. Saving on weekend dining can boost savings by 15% this month!
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper for dynamic colors matching CSS badges
function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'dining': return 'var(--color-warning)';
    case 'grocery': return 'var(--color-success)';
    case 'transportation': return 'var(--color-accent)';
    case 'rent': return 'var(--color-primary)';
    case 'bills': return '#a78bfa';
    case 'shopping': return '#f472b6';
    case 'medical': return '#f87171';
    default: return 'var(--text-muted)';
  }
}
