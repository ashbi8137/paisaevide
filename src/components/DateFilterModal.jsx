import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

function formatMonthName(yyyyMM) {
  if (!yyyyMM || typeof yyyyMM !== 'string' || yyyyMM.length < 7) return yyyyMM || '';
  const [y, m] = yyyyMM.split('-').map(Number);
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  if (!m || m < 1 || m > 12) return yyyyMM;
  return `${monthNames[m - 1]} ${y}`;
}

export function DateFilterModal({ isOpen, onClose, activeFilter, onApplyFilter, todayStr }) {
  const currentMonthStr = (todayStr || '').substring(0, 7) || '2026-09';
  
  const [mode, setMode] = useState(
    activeFilter.mode === 'DATE_RANGE' ? 'DATE_RANGE' :
    (activeFilter.fromMonth && activeFilter.fromMonth !== activeFilter.toMonth) ? 'MONTH_RANGE' : 'SINGLE_MONTH'
  );
  
  const [selectedMonth, setSelectedMonth] = useState(activeFilter.fromMonth || currentMonthStr);

  // Day Range
  const [fromDate, setFromDate] = useState(activeFilter.fromDate || todayStr);
  const [toDate, setToDate] = useState(activeFilter.toDate || todayStr);

  // Month Range
  const [fromMonth, setFromMonth] = useState(activeFilter.fromMonth || currentMonthStr);
  const [toMonth, setToMonth] = useState(activeFilter.toMonth || currentMonthStr);

  if (!isOpen) return null;

  // Generate last 6 months chips for 1-tap quick filtering
  const recentMonths = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    recentMonths.push({ mStr, label: formatMonthName(mStr) });
  }

  const handleApply = () => {
    if (mode === 'SINGLE_MONTH') {
      if (!selectedMonth) return;
      const label = formatMonthName(selectedMonth);
      onApplyFilter({ mode: 'MONTH_RANGE', fromMonth: selectedMonth, toMonth: selectedMonth, label });
    }
    else if (mode === 'DATE_RANGE') {
      if (!fromDate || !toDate) return;
      const label = fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`;
      onApplyFilter({ mode: 'DATE_RANGE', fromDate, toDate, label });
    }
    else if (mode === 'MONTH_RANGE') {
      if (!fromMonth || !toMonth) return;
      const label = fromMonth === toMonth ? formatMonthName(fromMonth) : `${formatMonthName(fromMonth)} to ${formatMonthName(toMonth)}`;
      onApplyFilter({ mode: 'MONTH_RANGE', fromMonth, toMonth, label });
    }
    onClose();
  };

  const handleQuickMonthTap = (mStr) => {
    setSelectedMonth(mStr);
    const label = formatMonthName(mStr);
    onApplyFilter({ mode: 'MONTH_RANGE', fromMonth: mStr, toMonth: mStr, label });
    onClose();
  };

  const handleReset = () => {
    onApplyFilter({ mode: 'PRESET', preset: 'ALL', label: 'All Time' });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxWidth: '420px', borderRadius: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Filter size={18} color="#10B981" />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Custom Date Filter</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Selector Tabs (3 Modes: Single Month, Month Range, Day Range) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.25rem', background: '#F1F5F9', padding: '0.25rem', borderRadius: '14px', marginBottom: '1.25rem' }}>
          {[
            { id: 'SINGLE_MONTH', label: 'Month' },
            { id: 'MONTH_RANGE', label: 'Month Range' },
            { id: 'DATE_RANGE', label: 'Day Range' }
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              style={{
                padding: '0.55rem 0.2rem',
                borderRadius: '10px',
                border: 'none',
                background: mode === m.id ? '#FFFFFF' : 'transparent',
                color: mode === m.id ? '#10B981' : '#64748B',
                fontWeight: mode === m.id ? 800 : 600,
                fontSize: '0.775rem',
                cursor: 'pointer',
                boxShadow: mode === m.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
                textAlign: 'center'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Mode 1: 1-Tap Single Month Selector */}
        {mode === 'SINGLE_MONTH' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              1-Tap Quick Month Selection
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              {recentMonths.map(item => {
                const isSelected = selectedMonth === item.mStr;
                return (
                  <button
                    key={item.mStr}
                    type="button"
                    onClick={() => handleQuickMonthTap(item.mStr)}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '12px',
                      border: isSelected ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                      background: isSelected ? '#ECFDF5' : '#FFFFFF',
                      color: isSelected ? '#047857' : 'var(--text-primary)',
                      fontWeight: isSelected ? 800 : 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{item.label}</span>
                    {isSelected && <Check size={14} color="#10B981" />}
                  </button>
                );
              })}
            </div>

            <div className="clean-input-group" style={{ marginBottom: 0 }}>
              <label className="clean-label">Or Pick Any Month</label>
              <input 
                type="month"
                max={currentMonthStr}
                className="clean-input"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Mode 2: Month Range (From Month -> To Month) */}
        {mode === 'MONTH_RANGE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="clean-input-group" style={{ marginBottom: 0 }}>
              <label className="clean-label">From Month</label>
              <input 
                type="month"
                max={currentMonthStr}
                className="clean-input"
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
              />
            </div>
            <div className="clean-input-group" style={{ marginBottom: 0 }}>
              <label className="clean-label">To Month</label>
              <input 
                type="month"
                max={currentMonthStr}
                className="clean-input"
                value={toMonth}
                onChange={(e) => setToMonth(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Mode 3: Day Range (From Date -> To Date) */}
        {mode === 'DATE_RANGE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="clean-input-group" style={{ marginBottom: 0 }}>
              <label className="clean-label">From Date</label>
              <CustomDatePicker
                value={fromDate}
                onChange={setFromDate}
                maxDate={todayStr}
              />
            </div>
            <div className="clean-input-group" style={{ marginBottom: 0 }}>
              <label className="clean-label">To Date</label>
              <CustomDatePicker
                value={toDate}
                onChange={setToDate}
                maxDate={todayStr}
              />
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            onClick={handleReset}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#475569',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
          <button 
            type="button" 
            onClick={handleApply}
            style={{
              flex: 1.5,
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              background: '#10B981',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Check size={16} />
            <span>Apply Filter</span>
          </button>
        </div>

      </div>
    </div>
  );
}
