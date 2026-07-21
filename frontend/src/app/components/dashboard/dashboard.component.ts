import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/transaction.model';

interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface Spike {
  category: string;
  amount: number;
  description: string;
  ratio: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnChanges {
  @Input() transactions: Transaction[] = [];
  @Input() linkedBanks: string[] = [];

  totalIncome = 0;
  totalExpense = 0;
  anomalies: Transaction[] = [];
  sortedCategories: SpendingCategory[] = [];
  spikes: Spike[] = [];
  budgetTip = 'Connect a bank feed or add manual transactions to get personalized budget insights.';
  duplicateCount = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactions'] || changes['linkedBanks']) {
      this.recalculate();
    }
  }

  recalculate(): void {
    const transactions = this.transactions;

    const incomeTrans = transactions.filter(t => t.category === 'Income');
    this.totalIncome = incomeTrans.reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenses = transactions.filter(t => t.category !== 'Income');
    this.totalExpense = expenses.reduce((sum, t) => {
      const isCredit = t.type === 'CREDIT';
      return sum + (isCredit ? -1 : 1) * (t.amount || 0);
    }, 0);

    this.anomalies = transactions.filter(t => t.anomalyStatus && t.anomalyStatus !== 'NONE');
    this.duplicateCount = this.anomalies.filter(a => a.anomalyStatus === 'DUPLICATE_SUSPECT').length;

    const categoryMap: Record<string, number> = {};
    expenses.forEach(t => {
      const isCredit = t.type === 'CREDIT';
      categoryMap[t.category] = (categoryMap[t.category] || 0) + (isCredit ? -1 : 1) * (t.amount || 0);
    });

    this.sortedCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: this.totalExpense > 0 ? (amount / this.totalExpense) * 100 : 0,
        color: this.getCategoryColor(category)
      }));

    // Spikes calculation
    this.spikes = [];
    if (transactions.length > 0) {
      const categoryTransactions: Record<string, Transaction[]> = {};
      expenses.forEach(t => {
        const cat = t.category || 'Uncategorized';
        if (!categoryTransactions[cat]) categoryTransactions[cat] = [];
        categoryTransactions[cat].push(t);
      });

      Object.entries(categoryTransactions).forEach(([category, list]) => {
        if (list.length < 3) return;
        const amounts = list.map(t => t.amount || 0);
        const maxAmount = Math.max(...amounts);
        const maxTx = list.find(t => t.amount === maxAmount)!;
        const otherAmounts = amounts.filter(a => a !== maxAmount);
        if (otherAmounts.length === 0) return;
        const avg = otherAmounts.reduce((s, a) => s + a, 0) / otherAmounts.length;
        if (avg > 0 && maxAmount > avg * 1.8 && maxAmount > 1000) {
          this.spikes.push({ category, amount: maxAmount, description: maxTx.description || 'Merchant', ratio: Math.round((maxAmount / avg) * 10) / 10 });
        }
      });
      this.spikes.sort((a, b) => b.ratio - a.ratio);
    }

    // Budget tip
    if (transactions.length > 0 && this.sortedCategories.length > 0) {
      const top = this.sortedCategories[0];
      const topPercent = this.totalExpense > 0 ? Math.round((top.amount / this.totalExpense) * 100) : 0;
      const catTotal = top.amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
      const cat = top.category.toLowerCase();
      if (cat === 'dining') {
        this.budgetTip = `You spent ${topPercent}% of your budget on Dining (₹${catTotal}). Preparing more meals at home could save you a significant amount this month.`;
      } else if (cat === 'shopping') {
        this.budgetTip = `Shopping is your highest variable cost at ${topPercent}% of your budget (₹${catTotal}). Setting a weekly limit could boost your savings.`;
      } else if (cat === 'rent' || cat === 'bills') {
        this.budgetTip = `Fixed costs (${top.category}) represent ${topPercent}% of your budget (₹${catTotal}). Focus on optimizing variable costs (Dining/Shopping) to boost savings.`;
      } else {
        this.budgetTip = `${top.category} is your largest expense category this month, representing ${topPercent}% of total expenses (₹${catTotal}).`;
      }
    } else if (transactions.length > 0) {
      this.budgetTip = `Your total expenses are ₹${this.totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Ask the chatbot "Help me create a savings plan" to optimize your budget.`;
    } else {
      this.budgetTip = 'Connect a bank feed or add manual transactions to get personalized budget insights.';
    }
  }

  getCategoryColor(category: string): string {
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

  formatCurrency(amount: number, opts?: Intl.NumberFormatOptions): string {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, ...opts });
  }

  linkedBankCount(): string {
    return `${this.linkedBanks.length} Bank${this.linkedBanks.length !== 1 ? 's' : ''}`;
  }
}
