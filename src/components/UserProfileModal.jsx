import React from 'react';
import { User, X, LogOut, ShieldCheck } from 'lucide-react';

export function UserProfileModal({ isOpen, onClose, currentName, onLogout }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxWidth: '380px', borderRadius: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#10B981" />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Account
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* User Info Card */}
        <div style={{ background: '#F8FAF9', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.2rem 1rem', marginBottom: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
            Active Profile
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
            {currentName}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.25rem 0.65rem', borderRadius: '20px', marginTop: '0.6rem' }}>
            <ShieldCheck size={14} color="#10B981" />
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#047857' }}>PIN Protected Space</span>
          </div>
        </div>

        {/* Switch / Lock Account Button */}
        {onLogout && (
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
              padding: '0.8rem 1rem',
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
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={16} />
            <span>Switch / Lock Account</span>
          </button>
        )}

      </div>
    </div>
  );
}
