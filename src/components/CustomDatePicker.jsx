import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function CustomDatePicker({ value, onChange, maxDate, label = "Date" }) {
  const [isOpen, setIsOpen] = useState(false);

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
    <div style={{ position: 'relative', width: '100%' }}>
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

      {/* Centered Modal Screen Calendar Popover */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '340px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.3)',
              padding: '1.25rem',
              animation: 'fadeIn 0.15s ease'
            }}
          >
            {/* Modal Calendar Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Select {label}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Month & Year Navigation Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', background: '#F8FAF9', padding: '0.5rem 0.75rem', borderRadius: '14px' }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
              >
                <ChevronLeft size={18} />
              </button>

              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary, #0F172A)' }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day of Week Labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.5rem' }}>
              {DAYS_SHORT.map((day) => (
                <span key={day} style={{ fontSize: '0.725rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                  {day}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.3rem' }}>
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
                      border: isToday && !isSelected ? '1.5px solid #10B981' : 'none',
                      background: isSelected ? '#10B981' : isToday ? '#ECFDF5' : 'transparent',
                      color: isSelected ? '#FFFFFF' : isFuture ? '#CBD5E1' : isToday ? '#047857' : '#0F172A',
                      fontSize: '0.85rem',
                      fontWeight: isSelected || isToday ? 800 : 600,
                      cursor: isFuture ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.1s ease',
                      opacity: isFuture ? 0.35 : 1
                    }}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
