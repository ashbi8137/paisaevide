import React, { useState } from 'react';
import { Banknote, ArrowRight, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export function WelcomeSetupScreen({ onComplete }) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPin = pin.trim();

    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    if (!trimmedPin || trimmedPin.length !== 4 || !/^\d{4}$/.test(trimmedPin)) {
      setError('Please enter a 4-digit numeric PIN (e.g. 1234)');
      return;
    }

    onComplete({ name: trimmedName, pin: trimmedPin });
  };

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)' }}>
          <Banknote size={32} color="#10B981" />
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Paisaevide
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Your Private & Secure Expense Tracker
        </p>
      </div>

      <form onSubmit={handleSubmit} className="clean-card" style={{ padding: '1.5rem 1.25rem', margin: 0, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.65rem 0.85rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Name Input */}
        <div className="clean-input-group" style={{ marginBottom: '1.1rem' }}>
          <label className="clean-label">Your Name</label>
          <input 
            type="text"
            className="clean-input"
            placeholder="e.g. Ashbin"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            style={{ fontSize: '1.05rem', padding: '0.75rem 1rem' }}
            autoFocus
            required
          />
        </div>

        {/* 4-Digit PIN Input */}
        <div className="clean-input-group" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label className="clean-label" style={{ margin: 0 }}>4-Digit Security PIN</label>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Keeps your data private</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]*"
              className="clean-input"
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(val);
                setError('');
              }}
              style={{ fontSize: '1.35rem', letterSpacing: '0.3em', padding: '0.75rem 2.75rem 0.75rem 1rem' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem'
              }}
              title={showPin ? 'Hide PIN' : 'Show PIN'}
            >
              {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Privacy Assurance Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: '#F8FAF9', border: '1px solid #E2E8F0', padding: '0.6rem 0.75rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
          <ShieldCheck size={16} color="#10B981" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.72rem', color: '#475569', lineHeight: '1.35' }}>
            Your PIN creates your own private space. No other person can see or access your dashboard.
          </span>
        </div>

        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: '14px',
            background: '#10B981',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.15s ease'
          }}
        >
          <Lock size={16} />
          <span>Open My Private Dashboard</span>
          <ArrowRight size={16} />
        </button>

      </form>

    </div>
  );
}
