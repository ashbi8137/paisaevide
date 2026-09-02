import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

export function DateFilterModal({ isOpen, onClose, activeFilter, onApplyFilter, todayStr }) {
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  const [fromDate, setFromDate] = useState(activeFilter.fromDate || todayStr);
  const [toDate, setToDate] = useState(activeFilter.toDate || todayStr);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!fromDate || !toDate) return;
    const label = fromDate === toDate ? fromDate : `${fromDate} → ${toDate}`;
    onApplyFilter({ mode: 'DATE_RANGE', fromDate, toDate, label });
    onClose();
  };

  const handlePreset = (preset, label, from, to) => {
    if (from && to) {
      onApplyFilter({ mode: 'DATE_RANGE', fromDate: from, toDate: to, label });
    } else {
      onApplyFilter({ mode: 'PRESET', preset, label });
    }
    onClose();
  };

  const handleReset = () => {
    onApplyFilter({ mode: 'PRESET', preset: 'ALL', label: 'All Time' });
    onClose();
  };

  const isToday = activeFilter.mode === 'PRESET' && activeFilter.preset === 'TODAY';
  const isYesterday = activeFilter.mode === 'PRESET' && activeFilter.preset === 'YESTERDAY';

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxWidth: '400px', borderRadius: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Filter size={18} color="#10B981" />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Filter by Date</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Pick</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handlePreset('TODAY', 'Today')}
              style={{
                flex: 1, padding: '0.55rem 0.75rem', borderRadius: '12px',
                background: isToday ? '#10B981' : '#F8FAFC',
                color: isToday ? '#FFFFFF' : 'var(--text-primary)',
                border: isToday ? 'none' : '1px solid #E2E8F0',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handlePreset('YESTERDAY', 'Yesterday')}
              style={{
                flex: 1, padding: '0.55rem 0.75rem', borderRadius: '12px',
                background: isYesterday ? '#10B981' : '#F8FAFC',
                color: isYesterday ? '#FFFFFF' : 'var(--text-primary)',
                border: isYesterday ? 'none' : '1px solid #E2E8F0',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
              }}
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => handlePreset('THIS_MONTH', 'This Month', `${todayStr.substring(0, 7)}-01`, todayStr)}
              style={{
                flex: 1, padding: '0.55rem 0.75rem', borderRadius: '12px',
                background: '#F8FAFC',
                color: 'var(--text-primary)',
                border: '1px solid #E2E8F0',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
              }}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>or custom range</span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        {/* 2 Simple Fields: From Date & To Date */}
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

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              borderRadius: '14px',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#475569',
              fontSize: '0.875rem',
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
              padding: '0.7rem 1rem',
              borderRadius: '14px',
              background: '#10B981',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.875rem',
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
            <span>Apply</span>
          </button>
        </div>

      </div>
    </div>
  );
}
