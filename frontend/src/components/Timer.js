import React from 'react';

export default function Timer({ timeFormatted, isWarning, isExpired }) {
  const color = isExpired ? '#ef4444' : isWarning ? '#f59e0b' : '#e5e7eb';
  return (
    <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 'bold', color }}>
      {timeFormatted}
    </div>
  );
}