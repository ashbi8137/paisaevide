import { createClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  USER_SESSION: 'paisaevide_session_v1',
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

// ─── User Identity & Private Session Management ─────────────────────────────

/**
 * Generates a deterministic, unique private account key from a normalized Name + PIN.
 * This guarantees privacy: without the exact Name + PIN, nobody can generate or access this account's data.
 */
export function generateAccountKey(name, pin) {
  const cleanName = (name || '').trim().toLowerCase();
  const cleanPin = (pin || '').trim();
  let hash = 0;
  const str = `${cleanName}:${cleanPin}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const safeName = cleanName.replace(/[^a-z0-9]/g, '') || 'user';
  return `usr_${safeName}_${hex}`;
}

export function getUserSession() {
  const saved = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.accountKey && parsed.name) return parsed;
    } catch (e) {}
  }
  return null;
}

export function saveUserSession(name, pin) {
  const trimmedName = (name || '').trim();
  const trimmedPin = (pin || '').trim();
  const accountKey = generateAccountKey(trimmedName, trimmedPin);
  const session = {
    name: trimmedName,
    pin: trimmedPin,
    accountKey
  };
  localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
  localStorage.setItem(STORAGE_KEYS.LOCKED_USER, trimmedName);
  return session;
}

export function clearUserSession() {
  localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
  localStorage.removeItem(STORAGE_KEYS.LOCKED_USER);
}

// Backward compatibility helper
export function getLockedUser() {
  const session = getUserSession();
  return session ? session.name : (localStorage.getItem(STORAGE_KEYS.LOCKED_USER) || '');
}

export function saveLockedUser(name) {
  return name.trim();
}

function getUserExpensesKey(accountKey) {
  return accountKey ? `paisaevide_expenses_${accountKey}` : STORAGE_KEYS.EXPENSES;
}

function getUserBudgetsKey(accountKey) {
  return accountKey ? `paisaevide_budgets_${accountKey}` : STORAGE_KEYS.BUDGETS;
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

// Helper: Prepare clean payload matching Supabase columns with strict user isolation
function toCleanPayload(item, accountKey, userName) {
  return {
    id: String(item.id),
    created_at: item.created_at || new Date().toISOString(),
    date: String(item.date),
    title: String(item.title),
    amount: Number(item.amount),
    category: String(item.category),
    device_id: accountKey || item.device_id || null,
    user_name: userName || item.user_name || null
  };
}

// ─── Expense CRUD (Strictly Filtered by User Account Key) ───────────────────

export async function fetchExpenses(activeSession) {
  const session = activeSession || getUserSession();
  if (!session || !session.accountKey) {
    return [];
  }

  const { accountKey, name } = session;
  const storageKey = getUserExpensesKey(accountKey);
  const localSaved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const client = getSupabaseClient();

  if (client) {
    try {
      // One-time legacy claim for Ashbin's existing September records (if any have device_id == null)
      if (name.toLowerCase() === 'ashbin') {
        try {
          const { data: legacyRows } = await client
            .from('expenses')
            .select('*')
            .is('device_id', null);
          if (legacyRows && legacyRows.length > 0) {
            const legacyIds = legacyRows.map(r => r.id);
            await client
              .from('expenses')
              .update({ device_id: accountKey, user_name: name })
              .in('id', legacyIds);
          }
        } catch (migErr) {
          console.warn("Legacy claim notice:", migErr);
        }
      }

      // Query ONLY this user's expenses from Supabase
      const { data, error } = await client
        .from('expenses')
        .select('*')
        .eq('device_id', accountKey)
        .order('date', { ascending: false });

      if (!error && Array.isArray(data)) {
        const itemMap = new Map();
        
        // Add local items
        localSaved.forEach(item => {
          if (item && item.id) itemMap.set(item.id, item);
        });

        // Merge remote items belonging to this user
        data.forEach(item => {
          if (item && item.id) itemMap.set(item.id, item);
        });

        const merged = Array.from(itemMap.values()).sort((a, b) => {
          const dateA = a.created_at || a.date || '';
          const dateB = b.created_at || b.date || '';
          return dateB.localeCompare(dateA);
        });

        localStorage.setItem(storageKey, JSON.stringify(merged));

        // Auto-sync any local items missing from Supabase for this user
        const remoteIds = new Set(data.map(i => i.id));
        const missingRemote = merged.filter(i => !remoteIds.has(i.id));
        if (missingRemote.length > 0) {
          const payloads = missingRemote.map(item => toCleanPayload(item, accountKey, name));
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

export async function addExpense(item, activeSession) {
  const session = activeSession || getUserSession();
  const accountKey = session?.accountKey;
  const userName = session?.name;
  const storageKey = getUserExpensesKey(accountKey);

  const newItem = {
    id: item.id || 'exp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    title: item.title,
    amount: Number(item.amount),
    category: item.category,
    date: item.date,
    created_at: new Date().toISOString(),
    device_id: accountKey,
    user_name: userName
  };

  // 1. Save locally to this user's scoped storage
  const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const updated = [newItem, ...current];
  localStorage.setItem(storageKey, JSON.stringify(updated));

  // 2. Insert into Supabase with this user's accountKey
  const client = getSupabaseClient();
  if (client && accountKey) {
    try {
      const payload = toCleanPayload(newItem, accountKey, userName);
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

export async function updateExpense(updatedItem, activeSession) {
  const session = activeSession || getUserSession();
  const accountKey = session?.accountKey;
  const userName = session?.name;
  const storageKey = getUserExpensesKey(accountKey);

  const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const updatedList = current.map(item => item.id === updatedItem.id ? { ...item, ...updatedItem, device_id: accountKey, user_name: userName } : item);
  localStorage.setItem(storageKey, JSON.stringify(updatedList));

  const client = getSupabaseClient();
  if (client && accountKey) {
    try {
      const payload = toCleanPayload(updatedItem, accountKey, userName);
      await client.from('expenses').update(payload).eq('id', updatedItem.id).eq('device_id', accountKey);
    } catch (e) {
      console.error("Supabase update error:", e);
    }
  }

  return updatedItem;
}

export async function deleteExpense(id, activeSession) {
  const session = activeSession || getUserSession();
  const accountKey = session?.accountKey;
  const storageKey = getUserExpensesKey(accountKey);

  const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(storageKey, JSON.stringify(updated));

  const client = getSupabaseClient();
  if (client && accountKey) {
    try {
      await client.from('expenses').delete().eq('id', id).eq('device_id', accountKey);
    } catch (e) {}
  }

  return updated;
}

export async function clearAllExpenses(activeSession) {
  const session = activeSession || getUserSession();
  const accountKey = session?.accountKey;
  const storageKey = getUserExpensesKey(accountKey);

  localStorage.removeItem(storageKey);

  const client = getSupabaseClient();
  if (client && accountKey) {
    try {
      await client.from('expenses').delete().eq('device_id', accountKey);
    } catch (e) {
      console.error("Supabase clear error:", e);
    }
  }
}

// ─── Monthly Budget Storage (Scoped by User) ───────────────────────

function getAllBudgets() {
  const session = getUserSession();
  const storageKey = getUserBudgetsKey(session?.accountKey);
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return {};
}

function saveAllBudgets(budgets) {
  const session = getUserSession();
  const storageKey = getUserBudgetsKey(session?.accountKey);
  localStorage.setItem(storageKey, JSON.stringify(budgets));
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


