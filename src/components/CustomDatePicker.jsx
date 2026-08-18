import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function CustomDatePicker({ value, onChange, maxDate, label = "Date" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse YYYY-MM-DD
  const parseDateStr = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return new Date();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    return new Date();
  };

  const currentDateObj = parseDateStr(value);
  const [viewYear, setViewYear] = useState(currentDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth());

  useEffect(() => {
    const d = parseDateStr(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value, isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];

  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  // Helper to format string YYYY-MM-DD
  const formatDateStr = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Get display text
  const getDisplayText = () => {
    if (value === todayStr) return `Today (${todayObj.getDate()} ${MONTH_NAMES[todayObj.getMonth()].substring(0, 3)})`;
    if (value === yesterdayStr) return `Yesterday (${yesterdayObj.getDate()} ${MONTH_NAMES[yesterdayObj.getMonth()].substring(0, 3)})`;
    const d = parseDateStr(value);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Generate calendar days for current viewMonth
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const selectedStr = formatDateStr(viewYear, viewMonth, day);
    if (maxDate && selectedStr > maxDate) return; // Future date blocked
    onChange(selectedStr);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isOpen ? '#FFFFFF' : 'var(--bg-input, #F1F5F3)',
          border: `1px solid ${isOpen ? '#10B981' : 'transparent'}`,
          borderRadius: '14px',
          padding: '0.75rem 1rem',
          fontSize: '0.925rem',
          fontWeight: 700,
          color: 'var(--text-primary, #0F172A)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
          outline: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarIcon size={17} color="#10B981" />
          <span>{getDisplayText()}</span>
        </div>
      </button>

      {/* Modern Floating Calendar Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            boxShadow: '0 16px 36px rgba(15, 23, 42, 0.15)',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.15s ease',
            minWidth: '280px'
          }}
        >
          {/* Quick Presets Strip */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem' }}>
            <button
              type="button"
              onClick={() => { onChange(todayStr); setIsOpen(false); }}
              style={{
                flex: 1,
                padding: '0.4rem',
                borderRadius: '10px',
                background: value === todayStr ? '#ECFDF5' : '#F8FAF9',
                border: `1px solid ${value === todayStr ? '#A7F3D0' : '#E2E8F0'}`,
                color: value === todayStr ? '#047857' : '#475569',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => { onChange(yesterdayStr); setIsOpen(false); }}
              style={{
                flex: 1,
                padding: '0.4rem',
                borderRadius: '10px',
                background: value === yesterdayStr ? '#ECFDF5' : '#F8FAF9',
                border: `1px solid ${value === yesterdayStr ? '#A7F3D0' : '#E2E8F0'}`,
                color: value === yesterdayStr ? '#047857' : '#475569',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Yesterday
            </button>
          </div>

          {/* Month & Year Navigation Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{ background: '#F1F5F9', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary, #0F172A)' }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{ background: '#F1F5F9', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day of Week Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.4rem' }}>
            {DAYS_SHORT.map((day) => (
              <span key={day} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.2rem' }}>
            {/* Empty slots for month start padding */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty_${idx}`} />
            ))}

            {/* Day buttons */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = formatDateStr(viewYear, viewMonth, dayNum);
              const isSelected = dateStr === value;
              const isToday = dateStr === todayStr;
              const isFuture = maxDate && dateStr > maxDate;

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={isFuture}
                  onClick={() => handleSelectDay(dayNum)}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    border: isToday && !isSelected ? '1px solid #10B981' : 'none',
                    background: isSelected ? '#10B981' : isToday ? '#ECFDF5' : 'transparent',
                    color: isSelected ? '#FFFFFF' : isFuture ? '#CBD5E1' : isToday ? '#047857' : '#0F172A',
                    fontSize: '0.825rem',
                    fontWeight: isSelected || isToday ? 800 : 600,
                    cursor: isFuture ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.1s ease',
                    opacity: isFuture ? 0.4 : 1
                  }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
