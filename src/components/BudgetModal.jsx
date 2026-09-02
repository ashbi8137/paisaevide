import React, { useState, useEffect } from 'react';
import { X, Check, Wallet, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { getBudget, saveBudget } from '../services/storage';
import { localMonthStr } from '../utils/parser';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function BudgetModal({ isOpen, onClose, initialMonth, categories = [], onSave }) {
  const activeCurrentMonth = localMonthStr(); // e.g. '2026-09'
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || activeCurrentMonth);
  const [salary, setSalary] = useState('');
  const [allocations, setAllocations] = useState({});
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Load budget for the selected month whenever modal opens or selectedMonth changes
  useEffect(() => {
    if (isOpen) {
      const targetMonth = selectedMonth || activeCurrentMonth;
      const b = getBudget(targetMonth);
      if (b) {
        setSalary(b.salary !== undefined && b.salary !== null ? String(b.salary) : '');
        setAllocations(b.allocations ? { ...b.allocations } : {});
      } else {
        setSalary('');
        setAllocations({});
      }
      setSavedFeedback(false);
    }
  }, [isOpen, selectedMonth, activeCurrentMonth]);

  if (!isOpen) return null;

  // Month navigation helper
  const changeMonth = (delta) => {
    const parts = (selectedMonth || activeCurrentMonth).split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1 + delta, 1);
    const nextY = d.getFullYear();
    const nextM = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${nextY}-${nextM}`);
  };

  // Format Month & Year for Display
  const getMonthDisplay = (m) => {
    const parts = (m || activeCurrentMonth).split('-');
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const monthName = !isNaN(monthNum) && monthNum >= 1 && monthNum <= 12 ? MONTH_NAMES[monthNum - 1] : '';
    return { monthName, year };
  };

  const { monthName, year } = getMonthDisplay(selectedMonth);
  const isThisMonth = selectedMonth === activeCurrentMonth;

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

    const saved = saveBudget(selectedMonth, numSalary, cleanedAllocations);

    if (onSave) {
      onSave({
        month: selectedMonth,
        budget: saved
      });
    }

    setSavedFeedback(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 400);
  };

  const handleClearThisMonth = () => {
    if (window.confirm(`Clear budget for ${monthName} ${year}?`)) {
      saveBudget(selectedMonth, 0, {});
      setSalary('');
      setAllocations({});
      if (onSave) {
        onSave({
          month: selectedMonth,
          budget: null
        });
      }
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
      {/* Header with Month Stepper */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #F1F5F9'
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
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary, #0F172A)', margin: 0 }}>
              Monthly Budget
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
              Set customized plan per month
            </span>
          </div>
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

      {/* Interactive Month Picker Stepper */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAF9',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '0.4rem 0.6rem',
          marginBottom: '1rem'
        }}
      >
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569'
          }}
          title="Previous Month"
        >
          <ChevronLeft size={16} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
            {monthName} {year}
          </div>
          {isThisMonth ? (
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '0.1rem 0.45rem', borderRadius: '6px' }}>
              Current Month
            </span>
          ) : (
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94A3B8' }}>
              Specific Month Budget
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => changeMonth(1)}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569'
          }}
          title="Next Month"
        >
          <ChevronRight size={16} />
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
            {monthName} Target Cash / Budget (₹)
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
            Category Allocations for {monthName}
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
        {numSalary > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
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
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
          {(numSalary > 0 || Object.keys(allocations).length > 0) && (
            <button
              type="button"
              onClick={handleClearThisMonth}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              title="Reset budget for this month"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          <button
            type="submit"
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '12px',
              background: savedFeedback ? '#059669' : '#10B981',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: '0 3px 10px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Check size={16} />
            <span>{savedFeedback ? 'Saved!' : `Save ${monthName} Budget`}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
