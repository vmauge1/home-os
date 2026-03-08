'use client';
import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase-browser';

// ── Design tokens ────────────────────────────────────────────
const C = { bg: '#09090F', card: '#13131A', border: '#2a2a3a', text: '#e8e8f0', muted: '#6b6b8a', accent: '#8B5CF6', green: '#22c55e', red: '#ef4444', orange: '#f97316' };

const TABS = [
  { id: 'courses', label: 'Courses', icon: '🛒' },
  { id: 'menage', label: 'Ménage', icon: '🧹' },
  { id: 'controles', label: 'Contrôles', icon: '🔧' },
  { id: 'repas', label: 'Repas', icon: '🍽️' },
  { id: 'cameras', label: 'Caméras', icon: '📷' },
  { id: 'urgences', label: 'Urgences', icon: '🚨' },
  { id: 'meteo', label: 'Météo', icon: '🌤️' },
];

// ── Composants UI réutilisables ──────────────────────────────
function Card({ children, style }) {
  return <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 12, ...style }}>{children}</div>;
}
function Btn({ onClick, children, variant = 'default', small, style }) {
  const bg = { primary: C.accent, danger: C.red, default: '#1e1e2e' }[variant];
  return <button onClick={onClick} style={{ background: bg, color: '#fff', border: 'none', borderRadius: 8, padding: small ? '5px 10px' : '8px 14px', fontSize: small ? 12 : 14, cursor: 'pointer', fontWeight: 500, ...style }}>{children}</button>;
}
function Input({ value, onChange, placeholder, onEnter, style }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} onKeyDown={e => e.key === 'Enter' && onEnter?.()} style={{ background: '#1e1e2e', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', ...style }} />;
}

// ── Hook générique : charge les données + écoute le temps réel ─
function useData(endpoint, table, familyId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => fetch(endpoint, { credentials: 'include' })
    .then(r => r.json()).then(d => setData(Array.isArray(d) ? d : []));

  useEffect(() => {
    load().finally(() => setLoading(false));

    // Abonnement temps réel Supabase
    const channel = supabase.channel(`${table}-${familyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter: `family_id=eq.${familyId}` }, load)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return [data, loading, load];
}

// Appel API + rechargement immédiat des données
async function apiAndReload(method, path, load, body) {
  await api(method, path, body);
  await load();
}

async function api(method, path, body) {
  const res = await fetch(path, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Erreur'); }
  return res.json();
}

// ── Onglet Courses ───────────────────────────────────────────
function CoursesTab({ familyId }) {
  const [items, loading, load] = useData('/api/courses', 'courses', familyId);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');

  const add = async () => { if (!name.trim()) return; await apiAndReload('POST', '/api/courses', load, { name, qty }); setName(''); setQty(''); };
  const toggle = (id) => apiAndReload('PATCH', `/api/courses/${id}`, load, { toggle: true });
  const del = (id) => apiAndReload('DELETE', `/api/courses/${id}`, load);

  const todo = items.filter(i => !i.done);
  const done = items.filter(i => i.done);

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input value={name} onChange={setName} placeholder="Article..." onEnter={add} style={{ flex: 2 }} />
          <Input value={qty} onChange={setQty} placeholder="Qté" onEnter={add} style={{ flex: 0.7 }} />
          <Btn onClick={add} variant="primary">+</Btn>
        </div>
      </Card>
      {loading ? <p style={{ color: C.muted }}>Chargement...</p> : <>
        {todo.map(item => (
          <Card key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
            <button onClick={() => toggle(item.id)} style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${C.accent}`, background: 'transparent', cursor: 'pointer', flexShrink: 0 }} />
            <span style={{ flex: 1, color: C.text }}>{item.name}</span>
            <span style={{ color: C.muted, fontSize: 13 }}>{item.qty}</span>
            <Btn onClick={() => del(item.id)} small variant="danger">✕</Btn>
          </Card>
        ))}
        {done.length > 0 && (
          <>
            <div style={{ color: C.muted, fontSize: 13, margin: '12px 0 8px' }}>Cochés ({done.length})</div>
            {done.map(item => (
              <Card key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', opacity: 0.5 }}>
                <button onClick={() => toggle(item.id)} style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: C.accent, cursor: 'pointer', flexShrink: 0, color: '#fff', fontSize: 12 }}>✓</button>
                <span style={{ flex: 1, color: C.muted, textDecoration: 'line-through' }}>{item.name}</span>
                <span style={{ color: C.muted, fontSize: 13 }}>{item.qty}</span>
              </Card>
            ))}
          </>
        )}
      </>}
    </div>
  );
}

// ── Onglet Ménage ────────────────────────────────────────────
function MenageTab({ familyId }) {
  const [tasks, loadingT, loadT] = useData('/api/menage/tasks', 'menage_tasks', familyId);
  const [machines, loadingM, loadM] = useData('/api/menage/machines', 'machine_tasks', familyId);
  const [newTask, setNewTask] = useState('');
  const [machForm, setMachForm] = useState({ machine: 'lave-linge', linge: '', programme: '' });
  const [tab, setTab] = useState('tasks');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['tasks', 'machines'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? C.accent : '#1e1e2e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
            {t === 'tasks' ? '🧹 Tâches' : '🫧 Machines'}
          </button>
        ))}
      </div>

      {tab === 'tasks' && <>
        <Card>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={newTask} onChange={setNewTask} placeholder="Nouvelle tâche..." onEnter={async () => { await apiAndReload('POST', '/api/menage/tasks', loadT, { name: newTask }); setNewTask(''); }} />
            <Btn onClick={async () => { await apiAndReload('POST', '/api/menage/tasks', loadT, { name: newTask }); setNewTask(''); }} variant="primary">+</Btn>
          </div>
        </Card>
        {loadingT ? <p style={{ color: C.muted }}>Chargement...</p> : tasks.map(t => (
          <Card key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: t.done ? 0.5 : 1 }}>
            <button onClick={() => apiAndReload('PATCH', `/api/menage/tasks/${t.id}`, loadT)} style={{ width: 22, height: 22, borderRadius: '50%', border: t.done ? 'none' : `2px solid ${C.green}`, background: t.done ? C.green : 'transparent', cursor: 'pointer', flexShrink: 0, color: '#fff', fontSize: 12 }}>{t.done ? '✓' : ''}</button>
            <span style={{ flex: 1, color: t.done ? C.muted : C.text, textDecoration: t.done ? 'line-through' : 'none' }}>{t.name}</span>
            <Btn onClick={() => apiAndReload('DELETE', `/api/menage/tasks/${t.id}`, loadT)} small variant="danger">✕</Btn>
          </Card>
        ))}
      </>}

      {tab === 'machines' && <>
        <Card>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={machForm.machine} onChange={e => setMachForm(f => ({ ...f, machine: e.target.value }))} style={{ background: '#1e1e2e', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text }}>
              <option value="lave-linge">Lave-linge</option>
              <option value="seche-linge">Sèche-linge</option>
            </select>
            <Input value={machForm.linge} onChange={v => setMachForm(f => ({ ...f, linge: v }))} placeholder="Linge (ex: draps)..." style={{ flex: 1 }} />
            <Input value={machForm.programme} onChange={v => setMachForm(f => ({ ...f, programme: v }))} placeholder="Programme (ex: 60°)..." style={{ flex: 1 }} />
            <Btn onClick={async () => { await apiAndReload('POST', '/api/menage/machines', loadM, machForm); setMachForm(f => ({ ...f, linge: '', programme: '' })); }} variant="primary">+</Btn>
          </div>
        </Card>
        {loadingM ? <p style={{ color: C.muted }}>Chargement...</p> : machines.map(m => (
          <Card key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: m.done ? 0.5 : 1 }}>
            <span style={{ fontSize: 22 }}>{m.machine === 'lave-linge' ? '🫧' : '💨'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: C.text, fontWeight: 500 }}>{m.linge}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>{m.machine} · {m.programme}</div>
            </div>
            <button onClick={() => apiAndReload('PATCH', `/api/menage/machines/${m.id}`, loadM)} style={{ background: m.done ? C.green : '#1e1e2e', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>{m.done ? '✓ Fait' : 'Terminer'}</button>
            <Btn onClick={() => apiAndReload('DELETE', `/api/menage/machines/${m.id}`, loadM)} small variant="danger">✕</Btn>
          </Card>
        ))}
      </>}
    </div>
  );
}

// ── Onglet Contrôles ─────────────────────────────────────────
function ControlesTab({ familyId }) {
  const [items, loading, load] = useData('/api/controles', 'controles', familyId);
  const [form, setForm] = useState({ name: '', icon: '🔧', freq_days: 90, is_critical: false });

  function daysLeft(item) {
    if (!item.last_check) return null;
    return Math.ceil((new Date(item.last_check).getTime() + item.freq_days * 86400000 - Date.now()) / 86400000);
  }
  function statusColor(item) {
    const d = daysLeft(item);
    if (d === null || d < 0) return C.red;
    if (d < 30) return C.orange;
    return C.green;
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Nom du contrôle..." style={{ flex: '1 1 150px' }} />
          <Input value={form.icon} onChange={v => setForm(f => ({ ...f, icon: v }))} placeholder="🔧" style={{ width: 56 }} />
          <Input value={form.freq_days} onChange={v => setForm(f => ({ ...f, freq_days: Number(v) }))} placeholder="Jours" style={{ width: 70 }} />
          <Btn onClick={async () => { await apiAndReload('POST', '/api/controles', load, form); setForm({ name: '', icon: '🔧', freq_days: 90, is_critical: false }); }} variant="primary">+</Btn>
        </div>
      </Card>
      {loading ? <p style={{ color: C.muted }}>Chargement...</p> : items.map(item => {
        const d = daysLeft(item);
        return (
          <Card key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: C.text, fontWeight: 500 }}>{item.name}{item.is_critical ? ' ⚠️' : ''}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>Tous les {item.freq_days} jours</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: statusColor(item), fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                {d === null ? 'Jamais fait' : d < 0 ? `En retard ${-d}j` : `${d}j restants`}
              </div>
              <Btn onClick={() => apiAndReload('PATCH', `/api/controles/${item.id}`, load, { check: true })} small>✓ Fait</Btn>
            </div>
            <Btn onClick={() => apiAndReload('DELETE', `/api/controles/${item.id}`, load)} small variant="danger">✕</Btn>
          </Card>
        );
      })}
    </div>
  );
}

// ── Onglet Repas ─────────────────────────────────────────────
function RepasTab({ familyId }) {
  const [items, loading, load] = useData('/api/repas', 'repas', familyId);
  const [form, setForm] = useState({ name: '', category: 'Plat', notes: '' });
  const [search, setSearch] = useState('');
  const CATS = ['Entrée', 'Plat', 'Dessert', 'Soupe', 'Salade', 'Autre'];

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Nom de la recette..." style={{ flex: '1 1 150px' }} />
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ background: '#1e1e2e', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text }}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          <Btn onClick={async () => { await apiAndReload('POST', '/api/repas', load, form); setForm(f => ({ ...f, name: '', notes: '' })); }} variant="primary">+</Btn>
        </div>
        <Input value={search} onChange={setSearch} placeholder="🔍 Rechercher..." />
      </Card>
      {loading ? <p style={{ color: C.muted }}>Chargement...</p> : filtered.map(item => (
        <Card key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => apiAndReload('PATCH', `/api/repas/${item.id}`, load, { is_favorite: !item.is_favorite })} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>{item.is_favorite ? '⭐' : '☆'}</button>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.text, fontWeight: 500 }}>{item.name}</div>
            <div style={{ color: C.muted, fontSize: 12 }}>{item.category}{item.notes ? ` · ${item.notes}` : ''}</div>
          </div>
          <Btn onClick={() => apiAndReload('DELETE', `/api/repas/${item.id}`, load)} small variant="danger">✕</Btn>
        </Card>
      ))}
    </div>
  );
}

// ── Onglet Caméras ───────────────────────────────────────────
const APP_LINKS = {
  yesihome: 'yesihome://',
  imoulife: 'imoulife://',
};
const APP_LABELS = {
  yesihome: 'YesiHome',
  imoulife: 'Imou Life',
};

function CamerasTab({ familyId }) {
  const [items, loading, load] = useData('/api/cameras', 'cameras', familyId);
  const [form, setForm] = useState({ name: '', location: '', app: 'yesihome' });

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Nom..." style={{ flex: '1 1 120px' }} />
          <Input value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} placeholder="Emplacement..." style={{ flex: '1 1 120px' }} />
          <select value={form.app} onChange={e => setForm(f => ({ ...f, app: e.target.value }))} style={{ background: '#1e1e2e', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text }}>
            <option value="yesihome">YesiHome</option>
            <option value="imoulife">Imou Life</option>
          </select>
          <Btn onClick={async () => { await apiAndReload('POST', '/api/cameras', load, form); setForm(f => ({ ...f, name: '', location: '' })); }} variant="primary">+</Btn>
        </div>
      </Card>
      {loading ? <p style={{ color: C.muted }}>Chargement...</p> : items.map(cam => (
        <Card key={cam.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28 }}>📷</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.text, fontWeight: 600 }}>{cam.name}</div>
            <div style={{ color: C.muted, fontSize: 12 }}>{cam.location}</div>
          </div>
          <a href={APP_LINKS[cam.app] || '#'} style={{
            background: '#1e1e2e', border: `1px solid ${C.border}`, borderRadius: 8,
            padding: '7px 12px', color: C.accent, fontSize: 13, fontWeight: 500,
            textDecoration: 'none', display: 'inline-block',
          }}>
            📱 {APP_LABELS[cam.app] || cam.app}
          </a>
          <Btn onClick={() => apiAndReload('DELETE', `/api/cameras/${cam.id}`, load)} small variant="danger">✕</Btn>
        </Card>
      ))}
    </div>
  );
}

// ── Onglet Urgences ──────────────────────────────────────────
function UrgencesTab({ familyId }) {
  const [items, loading, load] = useData('/api/contacts', 'contacts', familyId);
  const [form, setForm] = useState({ name: '', phone: '', category: 'Médical', note: '' });
  const CATS = ['Médical', 'Pompiers', 'Police', 'Famille', 'Voisins', 'Autre'];

  const grouped = CATS.reduce((acc, cat) => { const g = items.filter(i => i.category === cat); if (g.length > 0) acc[cat] = g; return acc; }, {});

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Nom..." style={{ flex: '1 1 120px' }} />
          <Input value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="Téléphone..." style={{ flex: '1 1 120px' }} />
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ background: '#1e1e2e', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text }}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          <Btn onClick={async () => { await apiAndReload('POST', '/api/contacts', load, form); setForm(f => ({ ...f, name: '', phone: '' })); }} variant="primary">+</Btn>
        </div>
      </Card>
      {loading ? <p style={{ color: C.muted }}>Chargement...</p> : Object.entries(grouped).map(([cat, contacts]) => (
        <div key={cat}>
          <div style={{ color: C.muted, fontSize: 12, fontWeight: 600, margin: '12px 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>{cat}</div>
          {contacts.map(c => (
            <Card key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.text, fontWeight: 500 }}>{c.name}</div>
                {c.note && <div style={{ color: C.muted, fontSize: 12 }}>{c.note}</div>}
              </div>
              <a href={`tel:${c.phone}`} style={{ color: C.green, fontWeight: 600, fontSize: 14, textDecoration: 'none', background: '#0d2e1a', padding: '6px 12px', borderRadius: 8 }}>📞 {c.phone}</a>
              <Btn onClick={() => apiAndReload('DELETE', `/api/contacts/${c.id}`, load)} small variant="danger">✕</Btn>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Onglet Météo ─────────────────────────────────────────────
function MeteoTab() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(async ({ coords }) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`;
        setWeather(await (await fetch(url)).json());
      } catch { setError('Impossible de charger la météo.'); }
    }, () => setError('Géolocalisation refusée.'));
  }, []);

  const WMO = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 51: '🌦️', 61: '🌧️', 71: '🌨️', 80: '🌦️', 95: '⛈️' };
  const icon = (code) => WMO[code] || WMO[Math.floor(code / 10) * 10] || '🌡️';

  if (error) return <Card><p style={{ color: C.red }}>{error}</p></Card>;
  if (!weather) return <Card><p style={{ color: C.muted }}>Localisation en cours...</p></Card>;

  const cur = weather.current;
  const daily = weather.daily;

  return (
    <div>
      <Card style={{ textAlign: 'center', padding: 28 }}>
        <div style={{ fontSize: 64 }}>{icon(cur.weather_code)}</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: C.text, marginTop: 8 }}>{Math.round(cur.temperature_2m)}°C</div>
        <div style={{ color: C.muted, marginTop: 8 }}>Humidité {cur.relative_humidity_2m}% · Vent {Math.round(cur.wind_speed_10m)} km/h</div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {daily.time?.map((date, i) => (
          <Card key={date} style={{ textAlign: 'center', padding: 12 }}>
            <div style={{ color: C.muted, fontSize: 12 }}>{new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
            <div style={{ fontSize: 24, margin: '6px 0' }}>{icon(daily.weather_code[i])}</div>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{Math.round(daily.temperature_2m_max[i])}°</div>
            <div style={{ color: C.muted, fontSize: 12 }}>{Math.round(daily.temperature_2m_min[i])}°</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── App principale ───────────────────────────────────────────
const TAB_COMPONENTS = { courses: CoursesTab, menage: MenageTab, controles: ControlesTab, repas: RepasTab, cameras: CamerasTab, urgences: UrgencesTab, meteo: MeteoTab };

export default function App({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('courses');
  const TabComponent = TAB_COMPONENTS[activeTab];

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    onLogout();
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif', color: C.text }}>
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>HOME<span style={{ color: C.accent }}>·</span>OS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: C.muted, fontSize: 13 }}>👤 {user?.name}</span>
          <Btn onClick={logout} small>Déconnexion</Btn>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', overflowX: 'auto', borderBottom: `1px solid ${C.border}`, background: C.card, padding: '0 16px' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: 'none', border: 'none', padding: '14px 14px', color: activeTab === tab.id ? C.accent : C.muted, borderBottom: activeTab === tab.id ? `2px solid ${C.accent}` : '2px solid transparent', cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>
        <TabComponent familyId={user?.familyId} />
      </div>
    </div>
  );
}
