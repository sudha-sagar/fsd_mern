import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#475569' }}>
        <Loader2 className="animate-spin" size={32} style={{ color: '#2563eb' }} />
        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#475569' }}>
      <Loader2 className="animate-spin" size={20} style={{ color: '#2563eb' }} />
      <span style={{ fontSize: '0.9rem' }}>{message}</span>
    </div>
  );
};

export default LoadingSpinner;
