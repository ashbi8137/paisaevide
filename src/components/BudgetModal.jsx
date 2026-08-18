import React, { useState, useEffect } from 'react';
import { X, Check, Wallet } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function BudgetModal({ isOpen, onClose, month, categories = [], currentBudget, onSave }) {
  const [salary, setSalary] = useState('');
  const [allocations, setAllocations] = useState({});

  useEffect(() => {
    if (isOpen && currentBudget) {
      setSalary(
        currentBudget.salary !== undefined && currentBudget.salary !== null
          ? String(currentBudget.salary)
          : ''
      );
      setAllocations(currentBudget.allocations ? { ...currentBudget.allocations } : {});
    } else if (!currentBudget) {
      setSalary('');
      setAllocations({});
    }
  }, [isOpen, currentBudget, month]);

  if (!isOpen) return null;

  // Format Month & Year for Header
  const getMonthAndYear = (m) => {
    if (!m) {
      const now = new Date();
      return { monthName: MONTH_NAMES[now.getMonth()], year: now.getFullYear() };
    }
    const parts = m.split('-');
    const year = parts[0] || new Date().getFullYear();
    const monthNum = parseInt(parts[1], 10);
    const monthName =
      !isNaN(monthNum) && monthNum >= 1 && monthNum <= 12
        ? MONTH_NAMES[monthNum - 1]
        : parts[1] || '';
    return { monthName, year };
  };

  const { monthName, year } = getMonthAndYear(month);

  const handleAllocationChange = (categoryName, value) => {
    setAllocations((prev) => ({
      ...prev,
      [categoryName]: value
    }));
  };

  // Calculate total allocations and unallocated amount
  const totalAllocated = Object.values(allocations).reduce((sum, val) => {
    const num = parseFloat(val);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const numSalary = parseFloat(salary) || 0;
  const unallocated = numSalary - totalAllocated;
  const isPositive = unallocated >= 0;

  const handleSave = (e) => {
    if (e) e.preventDefault();

    const cleanedAllocations = {};
    Object.entries(allocations).forEach(([cat, val]) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        cleanedAllocations[cat] = num;
      }
    });

    if (onSave) {
      onSave({
        salary: numSalary,
        allocations: cleanedAllocations
      });
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <div 
      style={{
        background: '#FFFFFF',
        border: '1px solid #A7F3D0',
        borderRadius: '20px',
        padding: '1.15rem',
        marginBottom: '1.25rem',
        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)',
        animation: 'fadeIn 0.2s ease',
        boxSizing: 'border-box',
        width: '100%'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981'
            }}
          >
            <Wallet size={16} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary, #0F172A)' }}>
            {monthName} {year} Budget
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: '#F1F5F9',
            border: 'none',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B'
          }}
        >
          <X size={14} />
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Salary Input */}
        <div>
          <label
            style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              color: 'var(--text-secondary, #475569)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.3rem',
              display: 'block'
            }}
          >
            Total Monthly Expense Budget (₹)
          </label>
          <input
            type="number"
            step="any"
            min="0"
            placeholder="0"
            style={{
              width: '100%',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#10B981',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '12px',
              padding: '0.6rem 0.85rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </div>

        {/* Category Allocations */}
        <div>
          <label
            style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              color: 'var(--text-secondary, #475569)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.4rem',
              display: 'block'
            }}
          >
            Category Allocations
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem',
              boxSizing: 'border-box'
            }}
          >
            {categories.map((c) => (
              <div
                key={c.id || c.name}
                style={{
                  background: '#F8FAF9',
                  border: '1px solid var(--border, #E2E8F0)',
                  borderRadius: '12px',
                  padding: '0.45rem 0.55rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  boxSizing: 'border-box',
                  minWidth: 0
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    minWidth: 0
                  }}
                >
                  {c.color && (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: c.color,
                        flexShrink: 0
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      color: 'var(--text-primary, #0F172A)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={c.name}
                  >
                    {c.name}
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  value={allocations[c.name] ?? ''}
                  onChange={(e) => handleAllocationChange(c.name, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border, #E2E8F0)',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    color: 'var(--text-primary, #0F172A)',
                    background: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live Unallocated Counter */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            padding: '0.6rem 0.85rem',
            borderRadius: '12px',
            background: isPositive ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${isPositive ? '#A7F3D0' : '#FCA5A5'}`,
            color: isPositive ? '#047857' : '#DC2626'
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Unallocated Balance:</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>
            {unallocated < 0
              ? `-₹${Math.abs(unallocated).toLocaleString('en-IN')}`
              : `₹${unallocated.toLocaleString('en-IN')}`}
          </span>
        </div>

        {/* Save & Cancel Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '12px',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#475569',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              flex: 1.5,
              padding: '0.65rem',
              borderRadius: '12px',
              background: '#10B981',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: '0 3px 10px rgba(16, 185, 129, 0.25)'
            }}
          >
            <Check size={16} />
            <span>Save Budget</span>
          </button>
        </div>
      </form>
    </div>
  );
}
