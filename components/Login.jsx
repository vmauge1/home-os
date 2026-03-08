'use client';
import { useState } from 'react';

export default function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data);
    } catch (err) {
      setError(err.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  }

  const inp = {
    width: '100%', padding: '12px 14px', background: '#1e1e2e',
    border: '1px solid #2a2a3a', borderRadius: 10, color: '#fff',
    fontSize: 15, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#13131A', border: '1px solid #2a2a3a', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
            HOME<span style={{ color: '#8B5CF6' }}>·</span>OS
          </div>
          <div style={{ color: '#6b6b8a', fontSize: 14, marginTop: 6 }}>Accès famille</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#9999bb', fontSize: 13, marginBottom: 8 }}>Prénom</label>
            <input style={inp} type="text" value={name} onChange={e => setName(e.target.value)} autoComplete="username" required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#9999bb', fontSize: 13, marginBottom: 8 }}>Mot de passe</label>
            <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          {error && (
            <div style={{ color: '#ff6b6b', fontSize: 13, textAlign: 'center', marginBottom: 16, padding: 10, background: '#2a1a1a', borderRadius: 8, border: '1px solid #4a2a2a' }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
