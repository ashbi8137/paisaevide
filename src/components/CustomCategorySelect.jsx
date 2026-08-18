import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function CustomCategorySelect({ categories = [], value, onChange, label = "Category" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCategory = categories.find(c => c.name === value) || { name: value || 'Select Category' };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (catName) => {
    onChange(catName);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
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
          fontSize: '0.95rem',
          fontWeight: 700,
          color: 'var(--text-primary, #0F172A)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
          outline: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
          {selectedCategory.color && (
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: selectedCategory.color,
                flexShrink: 0
              }}
            />
          )}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedCategory.name}
          </span>
        </div>
        <ChevronDown
          size={18}
          color="#64748B"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0
          }}
        />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
            zIndex: 999,
            padding: '0.4rem',
            maxHeight: '220px',
            overflowY: 'auto',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {categories.map((c) => {
            const isSelected = c.name === value;
            return (
              <div
                key={c.id || c.name}
                onClick={() => handleSelect(c.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: isSelected ? '#ECFDF5' : 'transparent',
                  color: isSelected ? '#047857' : 'var(--text-primary, #0F172A)',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                  marginBottom: '0.15rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  {c.color && (
                    <span
                      style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        background: c.color,
                        flexShrink: 0
                      }}
                    />
                  )}
                  <span>{c.name}</span>
                </div>
                {isSelected && <Check size={16} color="#10B981" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
