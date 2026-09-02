import React, { useState, useEffect } from 'react';
import { 
  Home, 
  PlusCircle, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Plus, 
  Download,
  Utensils,
  Car,
  ShoppingBag,
  Home as HomeIcon,
  Activity,
  Zap,
  Users,
  Tag,
  BarChart3,
  Calendar,
  Sparkles,
  User,
  Receipt,
  Filter,
  SlidersHorizontal,
  X,
  Edit3
} from 'lucide-react';

import { CATEGORY_DEFINITIONS, autoDetectCategory } from './utils/parser';
import { 
  fetchExpenses, 
  addExpense, 
  updateExpense,
  deleteExpense,
  clearAllExpenses,
  getStoredCategories,
  saveCustomCategory,
  getLockedUser,
  saveLockedUser,
  getBudget,
  saveBudget,
  autoCarryForwardBudget,
  getStoredQuickLogs,
  addQuickLog as addQuickLogStorage,
  deleteQuickLog as deleteQuickLogStorage,
  exportFullBackupJSON,
  importFullBackupJSON
} from './services/storage';

import { AddCategoryModal } from './components/AddCategoryModal';
import { WelcomeSetupScreen } from './components/WelcomeSetupScreen';
import { DateFilterModal } from './components/DateFilterModal';
import { BudgetModal } from './components/BudgetModal';
import { CustomCategorySelect } from './components/CustomCategorySelect';
import { CustomDatePicker } from './components/CustomDatePicker';
import { Check, Wallet, Trash2 as TrashIcon, Settings, ChevronDown, ChevronUp, Search } from 'lucide-react';

// Inline Edit Form - renders directly below a transaction row
function InlineEditForm({ expense, categories, todayStr, onSave, onCancel, onDelete }) {
  const [title, setTitle] = React.useState(expense.title || '');
  const [amount, setAmount] = React.useState(expense.amount || '');
  const [category, setCategory] = React.useState(expense.category || 'Food & Dining');
  const [date, setDate] = React.useState(expense.date || todayStr);
  const [error, setError] = React.useState('');
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { setError('Enter a title'); return; }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) { setError('Enter valid amount'); return; }
    if (date > todayStr) { setError('Future dates not allowed'); return; }
    onSave({ ...expense, title: trimmedTitle, amount: numAmount, category, date });
  };

  if (confirmDelete) {
    return (
      <div style={{
        background: '#FEF2F2',
        border: '1px solid #FCA5A5',
        borderRadius: '14px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#DC2626' }}>
          🗑️ Delete <strong>"{expense.title}"</strong> (₹{Number(expense.amount).toLocaleString('en-IN')})?
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            style={{ padding: '0.4rem 0.9rem', borderRadius: '10px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
          >
            No
          </button>
          <button
            type="button"
            onClick={() => onDelete(expense.id)}
            style={{ padding: '0.4rem 0.9rem', borderRadius: '10px', background: '#EF4444', border: 'none', color: '#FFF', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.4rem 0.7rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem', display: 'block' }}>Amount</label>
          <input type="number" step="any" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.6rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', fontWeight: 800, color: '#10B981', background: '#ECFDF5', outline: 'none', boxSizing: 'border-box' }} required />
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem', display: 'block' }}>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.6rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }} required />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem', display: 'block' }}>Category</label>
          <CustomCategorySelect categories={categories} value={category} onChange={setCategory} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem', display: 'block' }}>Date</label>
          <CustomDatePicker value={date} onChange={setDate} maxDate={todayStr} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={() => setConfirmDelete(true)}
          style={{ flex: 1, padding: '0.55rem', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
          <TrashIcon size={13} /> Delete
        </button>
        <button type="submit"
          style={{ flex: 1.5, padding: '0.55rem', borderRadius: '12px', background: '#10B981', border: 'none', color: '#FFF', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', boxShadow: '0 3px 10px rgba(16,185,129,0.3)' }}>
          <Check size={14} /> Save
        </button>
      </div>
    </form>
  );
}


export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, add, stats
  const [userName, setUserName] = useState('');
  const [isSetupDone, setIsSetupDone] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(CATEGORY_DEFINITIONS);

  // Modals & Expanded State
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Monthly Budget State
  const currentMonth = new Date().toISOString().substring(0, 7); // e.g. '2026-08'
  const [monthlyBudget, setMonthlyBudget] = useState(null);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState(todayStr);
  const [formError, setFormError] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Logs & Budget State
  const [quickLogs, setQuickLogs] = useState([]);
  const [isManagingQuickLogs, setIsManagingQuickLogs] = useState(false);
  const [quickLogSuccessMsg, setQuickLogSuccessMsg] = useState('');
  const [newQuickLogTitle, setNewQuickLogTitle] = useState('');
  const [isAddingQuickLogInline, setIsAddingQuickLogInline] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    mode: 'PRESET',
    preset: 'ALL',
    label: 'All Time'
  });

  useEffect(() => {
    const customCats = getStoredCategories();
    if (customCats.length > 0) {
      setCategories([...CATEGORY_DEFINITIONS, ...customCats]);
    }

    const savedName = getLockedUser();
    if (savedName) {
      setUserName(savedName);
      setIsSetupDone(true);
    }
    loadData();

    // Auto-carry-forward budget from last month
    const budget = autoCarryForwardBudget(currentMonth) || getBudget(currentMonth);
    setMonthlyBudget(budget);

    // Load Quick Logs
    setQuickLogs(getStoredQuickLogs());
  }, []);

  const handleAddQuickLogItem = (itemTitle, itemCat) => {
    if (!itemTitle || !itemTitle.trim()) return;
    const updated = addQuickLogStorage(itemTitle, itemCat || 'Food & Dining');
    setQuickLogs(updated);
    setQuickLogSuccessMsg('Added to Quick Logs!');
    setTimeout(() => setQuickLogSuccessMsg(''), 2000);
  };

  const handleDeleteQuickLogItem = (idOrTitle) => {
    const updated = deleteQuickLogStorage(idOrTitle);
    setQuickLogs(updated);
  };

  const handleSaveBudget = (data) => {
    const saved = saveBudget(currentMonth, data.salary, data.allocations);
    setMonthlyBudget(saved);
  };

  const loadData = async () => {
    const loaded = await fetchExpenses();
    setExpenses(loaded || []);
  };

  const handleSetupComplete = (name) => {
    const saved = saveLockedUser(name);
    setUserName(saved);
    setIsSetupDone(true);
    loadData();
  };

  // Clean Quick Presets
  const PRESETS = [
    { title: 'Breakfast', category: 'Food & Dining' },
    { title: 'Lunch', category: 'Food & Dining' },
    { title: 'Dinner', category: 'Food & Dining' },
    { title: 'Tea', category: 'Food & Dining' },
    { title: 'Uber', category: 'Transportation' },
    { title: 'Grocery', category: 'Shopping & Supplies' }
  ];

  const handleQuickAdd = (p) => {
    setTitle(p.title);
    setCategory(p.category);
    setAmount('');
    setDate(todayStr);
    setFormError('');
    setActiveTab('add');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Please enter a valid expense title.');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }

    if (date > todayStr) {
      setFormError('Future dates are not allowed. Please select today or a past date.');
      return;
    }

    const created = await addExpense({
      title: trimmedTitle,
      amount: numAmount,
      category,
      date,
      payment_method: 'UPI',
      is_fixed: false
    });

    if (created) {
      setExpenses(prev => [created, ...prev]);
    }
    setTitle('');
    setAmount('');
    setFormError('');
    setActiveTab('home');
  };

  const handleAddCategory = (newCat) => {
    const updatedCustoms = saveCustomCategory(newCat);
    setCategories([...CATEGORY_DEFINITIONS, ...updatedCustoms]);
  };

  const handleClearHistory = async () => {
    if (window.confirm(`Clear all expense history for ${userName}?`)) {
      await clearAllExpenses();
      setExpenses([]);
    }
  };

  const handleSaveEditedExpense = async (updatedItem) => {
    await updateExpense(updatedItem);
    const fresh = await fetchExpenses();
    setExpenses(fresh);
  };

  const handleDeleteExpense = async (id) => {
    await deleteExpense(id);
    setEditingExpense(null);
    const fresh = await fetchExpenses();
    setExpenses(fresh);
  };

  // Icon & Background Helper
  const getCategoryIcon = (catName) => {
    switch (catName) {
      case 'Food & Dining': return <Utensils size={18} color="#059669" />;
      case 'Transportation': return <Car size={18} color="#2563EB" />;
      case 'Shopping & Supplies': return <ShoppingBag size={18} color="#D97706" />;
      case 'Housing & Rent': return <HomeIcon size={18} color="#DC2626" />;
      case 'Fitness & Health': return <Activity size={18} color="#7C3AED" />;
      case 'Utilities & Bills': return <Zap size={18} color="#0284C7" />;
      case 'Transfers & Friends': return <Users size={18} color="#DB2777" />;
      default: return <Tag size={18} color="#64748B" />;
    }
  };

  const getCategoryBg = (catName) => {
    switch (catName) {
      case 'Food & Dining': return '#ECFDF5';
      case 'Transportation': return '#EFF6FF';
      case 'Shopping & Supplies': return '#FFFBEB';
      case 'Housing & Rent': return '#FEF2F2';
      case 'Fitness & Health': return '#F5F3FF';
      case 'Utilities & Bills': return '#F0F9FF';
      case 'Transfers & Friends': return '#FDF2F8';
      default: return '#F1F5F9';
    }
  };

  // Calculations (MUST be before any early return so hooks stay consistent)
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatDateGroupHeader = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return 'Unknown Date';
    
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(day) && monthIdx >= 0 && monthIdx < 12) {
        const monthName = MONTH_NAMES[monthIdx];
        if (dateStr === todayStr) return `Today (${day} ${monthName})`;
        if (dateStr === yesterdayStr) return `Yesterday (${day} ${monthName})`;
        return `${day} ${monthName}`;
      }
    }

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return dateStr;
  };

  // useMemo MUST be called before any early return (React hooks rule)
  const groupedExpenses = React.useMemo(() => {
    const groups = {};
    (expenses || []).forEach(item => {
      if (!item) return;
      const dKey = item.date || todayStr;
      if (!groups[dKey]) groups[dKey] = [];
      groups[dKey].push(item);
    });

    const sortedDateKeys = Object.keys(groups).sort((a, b) => (b > a ? 1 : b < a ? -1 : 0));

    return sortedDateKeys.map(dateKey => {
      const items = (groups[dateKey] || []).sort((a, b) => {
        const timeA = a.created_at || a.date || '';
        const timeB = b.created_at || b.date || '';
        return timeB > timeA ? 1 : timeB < timeA ? -1 : 0;
      });

      const dayTotal = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
      return { dateKey, items, dayTotal };
    });
  }, [expenses, todayStr]);

  const searchedGroupedExpenses = React.useMemo(() => {
    const query = (searchQuery || '').trim().toLowerCase();
    if (!query) return groupedExpenses;

    const groups = {};
    (expenses || []).forEach(item => {
      if (!item) return;
      const titleMatch = (item.title || '').toLowerCase().includes(query);
      const catMatch = (item.category || '').toLowerCase().includes(query);
      if (titleMatch || catMatch) {
        const dKey = item.date || todayStr;
        if (!groups[dKey]) groups[dKey] = [];
        groups[dKey].push(item);
      }
    });

    const sortedDateKeys = Object.keys(groups).sort((a, b) => (b > a ? 1 : b < a ? -1 : 0));

    return sortedDateKeys.map(dateKey => {
      const items = (groups[dateKey] || []).sort((a, b) => {
        const timeA = a.created_at || a.date || '';
        const timeB = b.created_at || b.date || '';
        return timeB > timeA ? 1 : timeB < timeA ? -1 : 0;
      });

      const dayTotal = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
      return { dateKey, items, dayTotal };
    });
  }, [expenses, searchQuery, todayStr, groupedExpenses]);

  // If user profile is not set, render 1-time full screen setup page
  if (!isSetupDone) {
    return <WelcomeSetupScreen onComplete={handleSetupComplete} />;
  }

  let grandTotal = 0;
  let todayTotal = 0;
  let yesterdayTotal = 0;
  let routineTotal = 0;
  let fixedTotal = 0;
  const dateTotalsMap = {};

  const nowObj = new Date();
  const cYear = nowObj.getFullYear();
  const cMonth = nowObj.getMonth() + 1;

  // Last Month Year & Month
  const lastMonthYear = cMonth === 1 ? cYear - 1 : cYear;
  const lastMonthNum = cMonth === 1 ? 12 : cMonth - 1;

  let thisMonthTotal = 0;
  let thisMonthRoutineTotal = 0;
  let thisMonthFixedTotal = 0;
  const thisMonthDateTotalsMap = {};

  let lastMonthTotal = 0;
  let lastMonthRoutineTotal = 0;
  let lastMonthFixedTotal = 0;
  const lastMonthDateTotalsMap = {};

  (expenses || []).forEach(item => {
    if (!item || typeof item !== 'object') return;
    const amt = Number(item.amount) || 0;
    grandTotal += amt;
    if (item.date === todayStr) todayTotal += amt;
    if (item.date === yesterdayStr) yesterdayTotal += amt;

    const catName = item.category || 'Other';
    const isFixed = item.is_fixed || ['Housing & Rent', 'Fitness & Health'].includes(catName);

    if (isFixed) {
      fixedTotal += amt;
    } else {
      routineTotal += amt;
    }

    if (item.date && typeof item.date === 'string') {
      dateTotalsMap[item.date] = (dateTotalsMap[item.date] || 0) + amt;

      const parts = item.date.split('-').map(Number);
      const yearNum = parts[0];
      const monthNum = parts[1];

      // Current Month matching
      if (yearNum === cYear && monthNum === cMonth) {
        thisMonthTotal += amt;
        if (isFixed) {
          thisMonthFixedTotal += amt;
        } else {
          thisMonthRoutineTotal += amt;
        }
        thisMonthDateTotalsMap[item.date] = (thisMonthDateTotalsMap[item.date] || 0) + amt;
      }

      // Last Month matching
      if (yearNum === lastMonthYear && monthNum === lastMonthNum) {
        lastMonthTotal += amt;
        if (isFixed) {
          lastMonthFixedTotal += amt;
        } else {
          lastMonthRoutineTotal += amt;
        }
        lastMonthDateTotalsMap[item.date] = (lastMonthDateTotalsMap[item.date] || 0) + amt;
      }
    }
  });

  const activeDaysCount = Math.max(1, Object.keys(dateTotalsMap).length);
  const dailyTotalAvg = Math.round(grandTotal / activeDaysCount);

  const thisMonthActiveDays = Math.max(1, Object.keys(thisMonthDateTotalsMap).length);
  const thisMonthDailyAvg = Math.round(thisMonthTotal / thisMonthActiveDays);

  const lastMonthActiveDays = Math.max(1, Object.keys(lastMonthDateTotalsMap).length);
  const lastMonthDailyAvg = Math.round(lastMonthTotal / lastMonthActiveDays);

  const diffYesterday = todayTotal - yesterdayTotal;
  const isHigher = diffYesterday > 0;
  const absDiff = Math.abs(diffYesterday);

  // CSV & JSON Backup Export/Import
  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Date', 'Title', 'Amount', 'Category'];
    const rows = expenses.map(e => [e.date, `"${e.title}"`, e.amount, `"${e.category}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Paisaevide_${userName}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonStr = exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Paisaevide_Backup_${userName || 'Data'}_${todayStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = importFullBackupJSON(event.target.result);
      if (success) {
        loadData();
        alert('Backup restored successfully!');
      } else {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  // Filter Matching Helper Function (100% Crash-Proof)
  const isItemInFilter = (item) => {
    if (!item || !item.date || typeof item.date !== 'string') return false;
    
    if (dateFilter.mode === 'DATE_RANGE') {
      const from = dateFilter.fromDate || '';
      const to = dateFilter.toDate || '';
      return item.date >= from && item.date <= to;
    }

    if (dateFilter.mode === 'MONTH_RANGE') {
      const itemMonth = item.date.length >= 7 ? item.date.substring(0, 7) : item.date;
      const fromM = dateFilter.fromMonth || '';
      const toM = dateFilter.toMonth || '';
      return itemMonth >= fromM && itemMonth <= toM;
    }

    if (dateFilter.mode === 'PRESET') {
      if (dateFilter.preset === 'TODAY') return item.date === todayStr;
      if (dateFilter.preset === 'YESTERDAY') return item.date === yesterdayStr;
      
      const parts = item.date.split('-');
      if (parts.length === 3) {
        const itemY = parseInt(parts[0], 10);
        const itemM = parseInt(parts[1], 10) - 1;
        const itemD = parseInt(parts[2], 10);
        const itemObj = new Date(itemY, itemM, itemD);
        const nowObj = new Date();
        const diffDays = Math.floor((nowObj - itemObj) / (1000 * 60 * 60 * 24));

        if (dateFilter.preset === 'LAST_10_DAYS') return diffDays >= 0 && diffDays < 10;
        if (dateFilter.preset === 'LAST_2_WEEKS') return diffDays >= 0 && diffDays < 14;
        if (dateFilter.preset === 'LAST_2_MONTHS') return diffDays >= 0 && diffDays < 60;
        if (dateFilter.preset === 'LAST_4_MONTHS') return diffDays >= 0 && diffDays < 120;
      }
    }

    return true; // ALL
  };

  return (
    <div className="app-shell">
      
      {/* Top Header */}
      <header className="top-header">
        <h1 className="app-title">Paisaevide</h1>
        
        {/* Permanent Locked User Badge (Non-clickable) */}
        <div 
          className="date-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #10B981', background: '#ECFDF5', color: '#047857' }}
        >
          <User size={14} />
          <span>{userName}</span>
        </div>
      </header>

      {/* TAB 1: HOME */}
      {activeTab === 'home' && (
        <div>
          
          {/* Today Total Card */}
          <div className="today-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="today-label">
                Hello, {userName} 👋
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="today-amount">₹{todayTotal.toLocaleString('en-IN')}</div>

            {/* Yesterday Comparison Pill */}
            <div>
              {yesterdayTotal === 0 ? (
                <span className="compare-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#E2E8F0' }}>
                  Yesterday: ₹0 recorded
                </span>
              ) : (
                <span className={`compare-badge ${isHigher ? 'compare-up' : 'compare-down'}`}>
                  {isHigher ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{isHigher ? `+₹${absDiff} vs yesterday` : `-₹${absDiff} lower than yesterday`}</span>
                </span>
              )}
            </div>
          </div>

          {/* Summary Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', margin: '0 0 0.85rem' }}>
            {/* Card 1: THIS MONTH */}
            <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>This Month</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3B82F6', marginTop: '0.2rem' }}>
                ₹{thisMonthTotal.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Last Month: ₹{lastMonthTotal.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Card 2: THIS MONTH AVG */}
            <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>This Month Avg</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981', marginTop: '0.2rem' }}>
                ₹{thisMonthDailyAvg}/day
              </div>
              <div style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Last Month: ₹{lastMonthDailyAvg}/day
              </div>
            </div>
          </div>

          {/* Customizable 1-Tap Quick Log Grid */}
          <div style={{ margin: '0 0 0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                1-Tap Quick Log
              </span>

              <button
                type="button"
                onClick={() => setIsManagingQuickLogs(!isManagingQuickLogs)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isManagingQuickLogs ? '#EF4444' : '#10B981',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {isManagingQuickLogs ? 'Done' : 'Manage'}
              </button>
            </div>

            {/* Quick Log Grid (Clean 3-column layout) */}
            <div className="preset-grid">
              {quickLogs.map((p) => (
                <div key={p.id || p.title} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="preset-button"
                    style={{ width: '100%', paddingRight: isManagingQuickLogs ? '1.5rem' : '0.5rem' }}
                    onClick={() => {
                      if (!isManagingQuickLogs) {
                        handleQuickAdd(p);
                      }
                    }}
                  >
                    + {p.title}
                  </button>

                  {/* Delete Button (visible when managing) */}
                  {isManagingQuickLogs && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuickLogItem(p.id || p.title);
                      }}
                      style={{
                        position: 'absolute',
                        right: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        color: '#DC2626',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title="Remove Quick Log"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Expense Search Bar */}
          <div style={{ margin: '0 0 0.85rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: searchQuery ? '1.5px solid #10B981' : '1px solid var(--border)',
              borderRadius: '16px',
              padding: '0.65rem 0.9rem',
              boxShadow: searchQuery ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 2px 6px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease'
            }}>
              <Search size={18} color={searchQuery ? '#10B981' : '#94A3B8'} style={{ marginRight: '0.6rem', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search expenses (e.g. Uber, Dinner)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  background: 'transparent'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    border: 'none',
                    background: '#F1F5F9',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748B',
                    padding: 0,
                    marginLeft: '0.4rem'
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Search Results Summary Header */}
            {searchQuery.trim() && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.2rem 0', fontSize: '0.775rem', fontWeight: 800, color: '#047857' }}>
                <span>Found {searchedGroupedExpenses.reduce((s, g) => s + g.items.length, 0)} result(s) for "{searchQuery}"</span>
                <span>Total: ₹{searchedGroupedExpenses.reduce((s, g) => s + g.dayTotal, 0).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Daily Transactions */}
          <div style={{ margin: '0' }}>

            {expenses.length === 0 ? (
              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.75rem 1rem', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <Receipt size={22} color="#10B981" />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  No transactions yet
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Tap <span style={{ color: '#10B981', fontWeight: 700 }}>+ Add Expense</span> below to log an entry
                </p>
              </div>
            ) : searchedGroupedExpenses.length === 0 ? (
              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.75rem 1rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  No expenses found
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  No entries match <span style={{ color: '#10B981', fontWeight: 700 }}>"{searchQuery}"</span>
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {searchedGroupedExpenses.map(group => (
                  <div key={group.dateKey}>
                    
                    {/* Date Divider Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.25rem', marginBottom: '0.4rem', borderBottom: '1px dashed #CBD5E1' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {formatDateGroupHeader(group.dateKey)}
                      </span>
                      <span style={{ fontSize: '0.775rem', fontWeight: 800, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.15rem 0.6rem', borderRadius: '10px' }}>
                        ₹{group.dayTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Transaction Rows within this date */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {group.items.map(item => (
                        <React.Fragment key={item.id}>
                          <div className="item-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="item-icon" style={{ background: getCategoryBg(item.category) }}>
                                {getCategoryIcon(item.category)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                  {item.category}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                ₹{item.amount.toLocaleString('en-IN')}
                              </span>

                              {/* Edit Expense Button */}
                              <button
                                type="button"
                                onClick={() => setEditingExpense(editingExpense?.id === item.id ? null : item)}
                                style={{
                                  background: editingExpense?.id === item.id ? '#ECFDF5' : '#F1F5F9',
                                  border: `1px solid ${editingExpense?.id === item.id ? '#A7F3D0' : '#E2E8F0'}`,
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  color: editingExpense?.id === item.id ? '#10B981' : '#475569',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Edit Expense"
                              >
                                {editingExpense?.id === item.id ? <X size={15} /> : <Edit3 size={15} />}
                              </button>
                            </div>
                          </div>

                          {/* Inline Edit Form - appears directly below this item */}
                          {editingExpense?.id === item.id && (
                            <div style={{
                              background: '#FAFBFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '16px',
                              padding: '0.85rem',
                              marginTop: '-0.2rem',
                              animation: 'fadeIn 0.2s ease'
                            }}>
                              <InlineEditForm
                                expense={item}
                                categories={categories}
                                todayStr={todayStr}
                                onSave={(updated) => {
                                  handleSaveEditedExpense(updated);
                                  setEditingExpense(null);
                                }}
                                onCancel={() => setEditingExpense(null)}
                                onDelete={handleDeleteExpense}
                              />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: ADD ENTRY */}
      {activeTab === 'add' && (
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '1rem 0 1.25rem' }}>Add New Expense</h2>

          <form onSubmit={handleAddSubmit} className="clean-card" style={{ margin: 0 }}>
            
            {formError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.65rem 0.85rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
                ⚠️ {formError}
              </div>
            )}

            <div className="clean-input-group">
              <label className="clean-label">Amount (₹)</label>
              <input 
                type="number"
                step="any"
                min="0.01"
                className="clean-input"
                placeholder="0.00"
                style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', background: '#ECFDF5' }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="clean-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="clean-label">Expense Title</label>
                {title.trim() && (
                  <button
                    type="button"
                    onClick={() => handleAddQuickLogItem(title, category)}
                    style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    + Quick Log
                  </button>
                )}
              </div>
              <input 
                type="text"
                className="clean-input"
                placeholder="e.g. Lunch, Tea, Auto, Uber"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) {
                    setCategory(autoDetectCategory(e.target.value, categories));
                  }
                }}
                required
              />
              {quickLogSuccessMsg && (
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', marginTop: '0.2rem' }}>
                  ✓ {quickLogSuccessMsg}
                </div>
              )}
            </div>

            <div className="clean-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="clean-label">Category</label>
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(true)}
                  style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  + Custom Category
                </button>
              </div>
              <CustomCategorySelect 
                categories={categories}
                value={category}
                onChange={setCategory}
              />
            </div>

            <div className="clean-input-group">
              <label className="clean-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Date (Past or Today only)</label>
              <CustomDatePicker
                value={date}
                onChange={setDate}
                maxDate={todayStr}
              />
            </div>

            <button type="submit" className="action-btn" style={{ marginTop: '0.5rem' }}>
              <Plus size={20} />
              <span>Save Entry</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: STATS & REPORTS */}
      {activeTab === 'stats' && (
        <div>
          
    {/* Page Title */}
    <div style={{ margin: '1rem 0 0.85rem' }}>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
        Reports & Analytics
      </h2>
    </div>

    {/* Top 2-Button Row: Monthly Budget + Custom Filter */}
    <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1rem' }}>

      {/* Monthly Budget Button */}
      <button
        type="button"
        onClick={() => setIsBudgetModalOpen(!isBudgetModalOpen)}
        style={{
          flex: 1,
          background: isBudgetModalOpen ? '#10B981' : '#FFFFFF',
          border: `1px solid ${isBudgetModalOpen ? '#10B981' : 'var(--border)'}`,
          color: isBudgetModalOpen ? '#FFFFFF' : 'var(--text-primary)',
          padding: '0.7rem 0.85rem',
          borderRadius: '16px',
          fontSize: '0.825rem',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          boxShadow: isBudgetModalOpen ? '0 4px 12px rgba(16, 185, 129, 0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
          transition: 'all 0.15s ease'
        }}
      >
        <Wallet size={16} color={isBudgetModalOpen ? '#FFFFFF' : '#10B981'} />
        <span>{isBudgetModalOpen ? 'Close Budget' : 'Monthly Budget'}</span>
      </button>

      {/* Custom Filter Button */}
      <button
        type="button"
        onClick={() => setIsFilterModalOpen(true)}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          padding: '0.7rem 0.85rem',
          borderRadius: '16px',
          background: ['DATE_RANGE', 'MONTH_RANGE'].includes(dateFilter.mode) ? '#10B981' : '#FFFFFF',
          color: ['DATE_RANGE', 'MONTH_RANGE'].includes(dateFilter.mode) ? '#FFFFFF' : 'var(--text-primary)',
          border: ['DATE_RANGE', 'MONTH_RANGE'].includes(dateFilter.mode) ? 'none' : '1px solid var(--border)',
          fontWeight: 800,
          fontSize: '0.825rem',
          cursor: 'pointer',
          boxShadow: ['DATE_RANGE', 'MONTH_RANGE'].includes(dateFilter.mode) ? '0 4px 12px rgba(16, 185, 129, 0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
          transition: 'all 0.15s ease'
        }}
      >
        <SlidersHorizontal size={15} />
        <span>{['DATE_RANGE', 'MONTH_RANGE'].includes(dateFilter.mode) ? dateFilter.label : 'Custom Filter'}</span>
        {['DATE_RANGE', 'MONTH_RANGE'].includes(dateFilter.mode) && (
          <span
            onClick={(e) => { e.stopPropagation(); setDateFilter({ mode: 'PRESET', preset: 'ALL', label: 'All Time' }); }}
            style={{ marginLeft: '0.15rem', display: 'flex', alignItems: 'center', opacity: 0.85 }}
          >
            <X size={13} />
          </span>
        )}
      </button>

    </div>

          {/* Inline Budget Allocation Panel */}
          <BudgetModal
            isOpen={isBudgetModalOpen}
            onClose={() => setIsBudgetModalOpen(false)}
            month={currentMonth}
            categories={categories}
            currentBudget={monthlyBudget}
            onSave={handleSaveBudget}
          />

          {/* Category Distribution Breakdown */}
          {(() => {
            const filtered = expenses.filter(isItemInFilter);

            const catTotals = {};
            let sum = 0;
            filtered.forEach(i => {
              const a = Number(i.amount) || 0;
              sum += a;
              catTotals[i.category] = (catTotals[i.category] || 0) + a;
            });

            // Current month per-category totals for monthly budget allocation cross-checking
            const currentMonthCatTotals = {};
            (expenses || []).forEach(i => {
              if (!i || !i.date || typeof i.date !== 'string') return;
              const parts = i.date.split('-').map(Number);
              if (parts[0] === cYear && parts[1] === cMonth) {
                const a = Number(i.amount) || 0;
                currentMonthCatTotals[i.category] = (currentMonthCatTotals[i.category] || 0) + a;
              }
            });

            const sorted = Object.entries(catTotals)
              .map(([name, tot]) => ({ name, tot, pct: sum > 0 ? Math.round((tot/sum)*100) : 0 }))
              .sort((a,b) => b.tot - a.tot);

            if (sorted.length === 0) {
              return (
                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No entries for this period.
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>

                {/* Total Expense Summary Card — only shown when a filter is active */}
                {(dateFilter.mode === 'DATE_RANGE' || dateFilter.mode === 'MONTH_RANGE' || (dateFilter.mode === 'PRESET' && dateFilter.preset !== 'ALL')) && (
                  <div style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    borderRadius: '18px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                        Total Spent
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                        {dateFilter.label || 'All Time'} · {sorted.length} {sorted.length === 1 ? 'category' : 'categories'}
                      </div>
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                      ₹{sum.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}

                {sorted.map((c, i) => {
                  const allocated = monthlyBudget?.allocations?.[c.name] || 0;
                  
                  // Evaluate monthly budget against current month's spent when viewing Total/Preset
                  const budgetSpent = (dateFilter.mode === 'PRESET' && dateFilter.preset === 'ALL') ? (currentMonthCatTotals[c.name] || 0) : c.tot;
                  const remaining = allocated - budgetSpent;
                  const barPct = allocated > 0 ? Math.min(100, Math.round((budgetSpent / allocated) * 100)) : c.pct;
                  const isOver = allocated > 0 && budgetSpent > allocated;
                  const barColor = isOver ? '#EF4444' : '#10B981';
                  const isExpanded = expandedCategory === c.name;

                  return (
                    <div 
                      key={i} 
                      className="clean-card" 
                      onClick={() => setExpandedCategory(isExpanded ? null : c.name)}
                      style={{ 
                        margin: 0, 
                        padding: '1rem', 
                        cursor: 'pointer',
                        border: isExpanded ? '1px solid #10B981' : '1px solid var(--border)',
                        transition: 'all 0.15s ease',
                        boxShadow: isExpanded ? '0 4px 14px rgba(16, 185, 129, 0.12)' : 'var(--shadow-soft)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.925rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</span>
                          {isExpanded ? <ChevronUp size={16} color="#10B981" /> : <ChevronDown size={16} color="#94A3B8" />}
                        </div>
                        <span style={{ fontWeight: 800, color: barColor }}>
                          {allocated > 0 ? `₹${budgetSpent.toLocaleString('en-IN')} / ₹${allocated.toLocaleString('en-IN')}` : `₹${c.tot.toLocaleString('en-IN')} (${c.pct}%)`}
                        </span>
                      </div>

                      <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${barPct}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.3s ease' }} />
                      </div>

                      {allocated > 0 && (
                        <div style={{ fontSize: '0.725rem', fontWeight: 700, marginTop: '0.3rem', color: isOver ? '#EF4444' : '#059669' }}>
                          {isOver ? `⚠️ Over by ₹${Math.abs(remaining).toLocaleString('en-IN')}` : `₹${remaining.toLocaleString('en-IN')} remaining`}
                        </div>
                      )}

                      {/* Date-Wise Itemized History Breakdown */}
                      {isExpanded && (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px dashed #E2E8F0', animation: 'fadeIn 0.2s ease' }}
                        >
                          <div style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                            Date-Wise History
                          </div>

                          {(() => {
                            const catItems = filtered.filter(item => item.category === c.name);
                            if (catItems.length === 0) {
                              return <div style={{ fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center', padding: '0.5rem 0' }}>No transactions recorded</div>;
                            }

                            // Group catItems by date
                            const groupsMap = {};
                            catItems.forEach(item => {
                              const d = item.date || 'Unknown Date';
                              if (!groupsMap[d]) groupsMap[d] = [];
                              groupsMap[d].push(item);
                            });

                            const sortedDates = Object.keys(groupsMap).sort((a, b) => b.localeCompare(a));

                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                                {sortedDates.map(dateKey => (
                                  <div key={dateKey} style={{ background: '#F8FAF9', borderRadius: '12px', padding: '0.55rem 0.75rem', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.2rem' }}>
                                      <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                                        {formatDateGroupHeader(dateKey)}
                                      </span>
                                      <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#047857' }}>
                                        ₹{groupsMap[dateKey].reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString('en-IN')}
                                      </span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                      {groupsMap[dateKey].map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
                                          <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{Number(item.amount).toLocaleString('en-IN')}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}



        </div>
      )}

      {/* 3-TAB BOTTOM NAVIGATION BAR */}
      <nav className="bottom-bar-3tab">
        <button 
          className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={22} />
          <span>Home</span>
        </button>

        {/* Center Distinct Action Button */}
        <button 
          className="center-add-button"
          onClick={() => setActiveTab('add')}
        >
          <Plus size={18} />
          <span>Add Expense</span>
        </button>

        <button 
          className={`tab-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={22} />
          <span>Stats</span>
        </button>
      </nav>

      {/* Date Filter Modal */}
      <DateFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        activeFilter={dateFilter}
        onApplyFilter={setDateFilter}
        todayStr={todayStr}
      />

      {/* Custom Category Modal */}
      <AddCategoryModal 
        isOpen={isAddCatModalOpen}
        onClose={() => setIsAddCatModalOpen(false)}
        onAddCategory={handleAddCategory}
      />



    </div>
  );
}
