import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Building } from 'lucide-react';
import type { Transaction } from '../services/api';

interface DashboardProps {
  transactions: Transaction[];
  linkedBanks: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, linkedBanks }) => {
  // Calculate aggregate metrics
  const expenses = transactions.filter(t => t.category !== 'Income');
  const totalExpense = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const incomeTrans = transactions.filter(t => t.category === 'Income');
  const totalIncome = incomeTrans.reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const anomalies = transactions.filter(t => t.anomalyStatus && t.anomalyStatus !== 'NONE');

  // Calculate category aggregates
  const categoryMap: Record<string, number> = {};
  expenses.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + (t.amount || 0);
  });

  const sortedCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1]);

  // Calculate dynamic spikes
  const spikes: Array<{ category: string; amount: number; description: string; ratio: number }> = [];
  if (transactions.length > 0) {
    const categoryTransactions: Record<string, Transaction[]> = {};
    expenses.forEach(t => {
      const cat = t.category || 'Uncategorized';
      if (!categoryTransactions[cat]) {
        categoryTransactions[cat] = [];
      }
      categoryTransactions[cat].push(t);
    });

    Object.entries(categoryTransactions).forEach(([category, list]) => {
      if (list.length < 3) return; // need a baseline to compute average
      const amounts = list.map(t => t.amount || 0);
      const maxAmount = Math.max(...amounts);
      const maxTx = list.find(t => t.amount === maxAmount)!;
      
      const otherAmounts = amounts.filter(a => a !== maxAmount);
      if (otherAmounts.length === 0) return;
      const avg = otherAmounts.reduce((sum, a) => sum + a, 0) / otherAmounts.length;
      
      if (avg > 0 && maxAmount > avg * 1.8 && maxAmount > 1000) {
        spikes.push({
          category,
          amount: maxAmount,
          description: maxTx.description || 'Merchant',
          ratio: Math.round((maxAmount / avg) * 10) / 10
        });
      }
    });
  }

  // Sort spikes to display the most significant ratio first
  spikes.sort((a, b) => b.ratio - a.ratio);

  // Generate dynamic budget tip
  let budgetTip = 'Connect a bank feed or add manual transactions to get personalized budget insights.';
  if (transactions.length > 0 && sortedCategories.length > 0) {
    const topCategory = sortedCategories[0];
    const topPercent = totalExpense > 0 ? Math.round((topCategory[1] / totalExpense) * 100) : 0;
    const catName = topCategory[0];
    const catTotal = topCategory[1].toLocaleString(undefined, { maximumFractionDigits: 0 });

    if (catName.toLowerCase() === 'dining') {
      budgetTip = `You spent ${topPercent}% of your budget on Dining (₹${catTotal}). Preparing more meals at home could save you a significant amount this month.`;
    } else if (catName.toLowerCase() === 'shopping') {
      budgetTip = `Shopping is your highest variable cost at ${topPercent}% of your budget (₹${catTotal}). Setting a weekly limit could boost your savings.`;
    } else if (catName.toLowerCase() === 'rent' || catName.toLowerCase() === 'bills') {
      budgetTip = `Fixed costs (${catName}) represent ${topPercent}% of your budget (₹${catTotal}). Focus on optimizing variable costs (Dining/Shopping) to boost savings.`;
    } else {
      budgetTip = `${catName} is your largest expense category this month, representing ${topPercent}% of total expenses (₹${catTotal}).`;
    }
  } else if (transactions.length > 0) {
    budgetTip = `Your total expenses are ₹${totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Ask the chatbot "Help me create a savings plan" to optimize your budget.`;
  }

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
            <span className="stat-value">{linkedBanks.length} Bank{linkedBanks.length !== 1 ? 's' : ''}</span>
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
            📊 FinVertex Spending Analysis
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
            Based on your active transactions and bank feeds, the FinVertex assistant can analyze anomalous patterns or recommend savings strategies.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem', color: 'var(--text-primary)' }}>
            {/* Duplicate Charges */}
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {transactions.length === 0 ? (
                <span>Connect a bank feed or add manual entries to scan for duplicate charges.</span>
              ) : anomalies.filter(a => a.anomalyStatus === 'DUPLICATE_SUSPECT').length > 0 ? (
                <span>
                  <strong>⚠️ Suspected Duplicate Charges:</strong> {anomalies.filter(a => a.anomalyStatus === 'DUPLICATE_SUSPECT').length} items found. Ask the chatbot: <em>"How do I resolve duplicate charges?"</em> to inspect.
                </span>
              ) : (
                <span><strong>✓ No Duplicate Charges:</strong> Your accounts look clean! No duplicate billing events suspected.</span>
              )}
            </div>
            
            {/* Spikes */}
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {transactions.length === 0 ? (
                <span>No anomalies detected. Your transactions are within standard parameters.</span>
              ) : spikes.length > 0 ? (
                <span>
                  <strong>🚨 {spikes[0].category} Spike:</strong> You had a high {spikes[0].category} expense of ₹{spikes[0].amount.toLocaleString()} ({spikes[0].description}) recently. That is {spikes[0].ratio}x higher than your average {spikes[0].category} spending.
                </span>
              ) : (
                <span><strong>✓ Spending Spikes:</strong> No sudden spending spikes detected this week. Your transactions are within normal limits.</span>
              )}
            </div>

            {/* Budget Tip */}
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <strong>💡 Budget Tip:</strong> {budgetTip}
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
