'use client';
import { useEffect, useState } from 'react';
import Login from '@/components/Login';
import App from '@/components/App';

export default function Page() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(u => setUser(u))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#09090F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6b8a', fontFamily: 'Inter, sans-serif' }}>
      Chargement...
    </div>
  );

  if (!user) return <Login onLogin={setUser} />;
  return <App user={user} onLogout={() => setUser(null)} />;
}
