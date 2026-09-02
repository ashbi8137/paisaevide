import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

export function DateFilterModal({ isOpen, onClose, activeFilter, onApplyFilter, todayStr }) {
  const [fromDate, setFromDate] = useState(activeFilter.fromDate || todayStr);
  const [toDate, setToDate] = useState(activeFilter.toDate || todayStr);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!fromDate || !toDate) return;
    const label = fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`;
    onApplyFilter({ mode: 'DATE_RANGE', fromDate, toDate, label });
    onClose();
  };

  const handleReset = () => {
    onApplyFilter({ mode: 'PRESET', preset: 'ALL', label: 'All Time' });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxWidth: '420px', borderRadius: '24px' }}>
        
        {/* Header */}
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

        {/* 2 Simple Fields: From Date & To Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
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
