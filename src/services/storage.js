import { createClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  EXPENSES: 'paisaevide_expenses_v10',
  LOCKED_USER: 'paisaevide_user_v10',
  SUPABASE_CONFIG: 'expenso_supabase_cfg',
  CUSTOM_CATEGORIES: 'expenso_custom_cats_v1',
  BUDGETS: 'paisaevide_budgets_v1',
  QUICK_LOGS: 'paisaevide_quick_logs_v1'
};

let supabaseClientInstance = null;

export function getSupabaseClient() {
  if (supabaseClientInstance) return supabaseClientInstance;

  const cfg = getSupabaseConfig();
  if (cfg.url && cfg.anonKey) {
    try {
      supabaseClientInstance = createClient(cfg.url, cfg.anonKey);
      return supabaseClientInstance;
    } catch (e) {
      console.warn("Supabase client init error", e);
    }
  }
  return null;
}

export function getSupabaseConfig() {
  const saved = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://pmyabpjpnmotfhlyaxwi.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBteWFicGpwbm1vdGZobHlheHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTY2NjMsImV4cCI6MjEwMDgzMjY2M30.mnoP1xJTGpdgmoxBbU7ir8ujz-ehpCeVRkE2GplYZ9A'
  };
}

// Permanent Locked User Name Storage
export function getLockedUser() {
  return localStorage.getItem(STORAGE_KEYS.LOCKED_USER) || '';
}

export function saveLockedUser(name) {
  const current = getLockedUser();
  if (current) return current;
  localStorage.setItem(STORAGE_KEYS.LOCKED_USER, name.trim());
  return name.trim();
}

// Custom Categories Storage
export function getStoredCategories() {
  const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [];
}

export function saveCustomCategory(categoryObj) {
  const existing = getStoredCategories();
  const updated = [...existing, categoryObj];
  localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(updated));
  return updated;
}

// Helper: Prepare clean payload matching Supabase columns
function toCleanPayload(item) {
  return {
    id: String(item.id),
    created_at: item.created_at || new Date().toISOString(),
    date: String(item.date),
    title: String(item.title),
    amount: Number(item.amount),
    category: String(item.category)
  };
}

// Expense CRUD operations (Bulletproof ID-Merged Dual Sync — Zero Data Loss)
export async function fetchExpenses() {
  const localSaved = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const client = getSupabaseClient();

  if (client) {
    try {
      // Query all expenses from Supabase
      const { data, error } = await client
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (!error && Array.isArray(data)) {
        // Merge Local Storage and Remote Supabase rows by item ID so NO items (Tea, Lunch, etc.) are ever lost!
        const itemMap = new Map();
        
        // Add local items first
        localSaved.forEach(item => {
          if (item && item.id) itemMap.set(item.id, item);
        });

        // Merge remote items from Supabase
        data.forEach(item => {
          if (item && item.id) itemMap.set(item.id, item);
        });

        const merged = Array.from(itemMap.values()).sort((a, b) => {
          const dateA = a.created_at || a.date || '';
          const dateB = b.created_at || b.date || '';
          return dateB.localeCompare(dateA);
        });

        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(merged));

        // Auto-sync any local items that are missing from Supabase in the background
        const remoteIds = new Set(data.map(i => i.id));
        const missingRemote = merged.filter(i => !remoteIds.has(i.id));
        if (missingRemote.length > 0) {
          const payloads = missingRemote.map(toCleanPayload);
          client.from('expenses').upsert(payloads, { onConflict: 'id' }).then(() => {}).catch(() => {});
        }

        return merged;
      }
    } catch (e) {
      console.warn("Supabase fetch notice:", e);
    }
  }

  return localSaved;
}

export async function addExpense(item) {
  const newItem = {
    id: item.id || 'exp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    title: item.title,
    amount: Number(item.amount),
    category: item.category,
    date: item.date,
    created_at: new Date().toISOString()
  };

  // 1. Save locally immediately to guarantee 0 data loss
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const updated = [newItem, ...current];
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));

  // 2. Insert to Supabase cloud database with clean 6-column payload
  const client = getSupabaseClient();
  if (client) {
    try {
      const payload = toCleanPayload(newItem);
      const { error } = await client.from('expenses').upsert([payload], { onConflict: 'id' });
      if (error) {
        console.warn("Supabase sync notice:", error.message);
      }
    } catch (e) {
      console.warn("Supabase sync exception:", e);
    }
  }

  return newItem;
}

export async function updateExpense(updatedItem) {
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const updatedList = current.map(item => item.id === updatedItem.id ? { ...item, ...updatedItem } : item);
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updatedList));

  const client = getSupabaseClient();
  if (client) {
    try {
      const payload = toCleanPayload(updatedItem);
      await client.from('expenses').update(payload).eq('id', updatedItem.id);
    } catch (e) {
      console.error("Supabase update error:", e);
    }
  }

  return updatedItem;
}

export async function deleteExpense(id) {
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('expenses').delete().eq('id', id);
    } catch (e) {}
  }

  return updated;
}

export async function clearAllExpenses() {
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('expenses').delete().neq('id', 'keep_nothing');
    } catch (e) {
      console.error("Supabase clear error:", e);
    }
  }
}

// ─── Monthly Budget Storage ───────────────────────────────────────

function getAllBudgets() {
  const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return {};
}

function saveAllBudgets(budgets) {
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
}

/**
 * Get budget for a specific month.
 * @param {string} month - e.g. '2026-08'
 * @returns {{ salary: number, allocations: Record<string, number> } | null}
 */
export function getBudget(month) {
  const budgets = getAllBudgets();
  return budgets[month] || null;
}

/**
 * Save budget for a specific month.
 * @param {string} month - e.g. '2026-08'
 * @param {number} salary
 * @param {Record<string, number>} allocations - { 'Food & Dining': 8000, ... }
 */
export function saveBudget(month, salary, allocations) {
  const budgets = getAllBudgets();
  budgets[month] = { salary: Number(salary) || 0, allocations: allocations || {} };
  saveAllBudgets(budgets);
  return budgets[month];
}

/**
 * Auto-carry forward: if current month has no budget, copy from previous month.
 * @param {string} currentMonth - e.g. '2026-08'
 * @returns {{ salary: number, allocations: Record<string, number> } | null}
 */
export function autoCarryForwardBudget(currentMonth) {
  const existing = getBudget(currentMonth);
  if (existing) return existing;

  // Calculate previous month string
  const [y, m] = currentMonth.split('-').map(Number);
  const prevDate = new Date(y, m - 2, 1); // m-1 is current month (0-indexed), m-2 is previous
  const prevMonth = prevDate.getFullYear() + '-' + String(prevDate.getMonth() + 1).padStart(2, '0');

  const prevBudget = getBudget(prevMonth);
  if (prevBudget) {
    saveBudget(currentMonth, prevBudget.salary, { ...prevBudget.allocations });
    return getBudget(currentMonth);
  }

  return null;
}

// ─── Customizable Quick Logs Storage ───────────────────────────────

const DEFAULT_QUICK_LOGS = [
  { id: 'ql_breakfast', title: 'Breakfast', category: 'Food & Dining' },
  { id: 'ql_lunch', title: 'Lunch', category: 'Food & Dining' },
  { id: 'ql_dinner', title: 'Dinner', category: 'Food & Dining' },
  { id: 'ql_tea', title: 'Tea', category: 'Food & Dining' },
  { id: 'ql_uber', title: 'Uber', category: 'Transportation' },
  { id: 'ql_grocery', title: 'Grocery', category: 'Shopping & Supplies' }
];

export function getStoredQuickLogs() {
  const saved = localStorage.getItem(STORAGE_KEYS.QUICK_LOGS);
  if (saved !== null) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  // Only fall back to defaults if nothing has ever been saved
  return DEFAULT_QUICK_LOGS;
}

export function saveQuickLogs(list) {
  localStorage.setItem(STORAGE_KEYS.QUICK_LOGS, JSON.stringify(list));
  return list;
}

export function addQuickLog(title, category = 'Food & Dining') {
  const current = getStoredQuickLogs();
  const trimmed = title.trim();
  if (!trimmed) return current;

  // Don't add duplicate titles
  if (current.some(item => item.title.toLowerCase() === trimmed.toLowerCase())) {
    return current;
  }

  const newLog = {
    id: 'ql_' + Date.now().toString(36),
    title: trimmed,
    category
  };

  const updated = [...current, newLog];
  return saveQuickLogs(updated);
}

export function deleteQuickLog(idOrTitle) {
  const current = getStoredQuickLogs();
  const updated = current.filter(item => item.id !== idOrTitle && item.title !== idOrTitle);
  return saveQuickLogs(updated);
}

// ─── Full Data Backup (JSON Export & Import) ─────────────────────

export function exportFullBackupJSON() {
  const data = {
    user: getLockedUser(),
    expenses: JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]'),
    categories: getStoredCategories(),
    budgets: JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS) || '{}'),
    quickLogs: getStoredQuickLogs(),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
}

export function importFullBackupJSON(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object') return false;

    if (Array.isArray(data.expenses)) {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
      const itemMap = new Map();
      current.forEach(i => i && i.id && itemMap.set(i.id, i));
      data.expenses.forEach(i => i && i.id && itemMap.set(i.id, i));
      const merged = Array.from(itemMap.values());
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(merged));

      // Sync imported items to Supabase in background
      const client = getSupabaseClient();
      if (client) {
        const payloads = merged.map(toCleanPayload);
        client.from('expenses').upsert(payloads, { onConflict: 'id' }).then(() => {}).catch(() => {});
      }
    }

    if (data.user) {
      saveLockedUser(data.user);
    }

    if (data.budgets && typeof data.budgets === 'object') {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data.budgets));
    }

    if (Array.isArray(data.quickLogs)) {
      saveQuickLogs(data.quickLogs);
    }

    return true;
  } catch (e) {
    console.error("Import backup error:", e);
    return false;
  }
}


