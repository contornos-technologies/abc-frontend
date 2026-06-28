import { useState, useEffect } from 'react';
import { initGA } from '../../lib/analytics';

const CONSENT_KEY = 'abc_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved === 'accepted') {
      initGA();
    } else if (!saved) {
      setVisible(true);
    }
    // se saved === 'rejected', não faz nada — GA nunca inicia
  }, []);

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    initGA();
    setVisible(false);
  }

  function handleReject() {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#071C35',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, flex: 1, minWidth: 260 }}>
        Utilizamos cookies analíticos para compreender como os visitantes navegam no site.{' '}
        <a
          href="/privacy"
          style={{ color: '#F7941D', textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          Saber mais
        </a>
        .
      </p>

      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={handleReject}
          style={{
            padding: '8px 18px',
            fontSize: 13,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'transparent',
            color: 'rgba(255,255,255,0.65)',
            cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
        >
          Rejeitar
        </button>

        <button
          onClick={handleAccept}
          style={{
            padding: '8px 18px',
            fontSize: 13,
            borderRadius: 999,
            border: 'none',
            backgroundColor: '#F7941D',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ea860f'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F7941D'; }}
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
