import React, { useState } from 'react';
import { User, X, Check, LogOut, Shield } from 'lucide-react';

export function UserProfileModal({ isOpen, onClose, currentName, onSaveName, onLogout }) {
  const [nameInput, setNameInput] = useState(currentName || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    onSaveName(trimmed);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxWidth: '420px', borderRadius: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#10B981" />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Profile & Account
            </h2>
          </div>
          {currentName && (
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="clean-input-group" style={{ marginBottom: 0 }}>
            <label className="clean-label">Your Name</label>
            <input 
              type="text"
              className="clean-input"
              placeholder="e.g. Ashbin"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
              required
            />
          </div>

          <button 
            type="submit" 
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
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
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
            }}
          >
            <Check size={16} />
            <span>Update Name</span>
          </button>

          {onLogout && (
            <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '0.85rem', marginTop: '0.25rem' }}>
              <button 
                type="button" 
                onClick={() => {
                  if (window.confirm("Lock and switch account? You will need your PIN to sign back in.")) {
                    onLogout();
                    onClose();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '14px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#DC2626',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <LogOut size={16} />
                <span>Switch / Lock Account</span>
              </button>
            </div>
          )}

        </form>

      </div>
    </div>
  );
}
