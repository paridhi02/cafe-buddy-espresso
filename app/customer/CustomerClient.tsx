'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type MenuItem = { id: string; name: string; description: string | null; price: number; prep_minutes: number; category: string; available: boolean };
type Cart = Record<string, number>;

export default function Customer() {
  const sp = useSearchParams();
  const table = Number(sp.get('table') || 0);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cat, setCat] = useState('All');
  const [cart, setCart] = useState<Cart>({});
  const [show, setShow] = useState(false);
  const [done, setDone] = useState<any>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/menu')
      .then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error || 'Could not load menu'); return data; })
      .then(data => setMenu(data.items || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(menu.map(x => x.category)))], [menu]);
  const list = useMemo(() => menu.filter(x => (cat === 'All' || x.category === cat) && x.available), [cat, menu]);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = Object.entries(cart).reduce((s, [id, q]) => s + (menu.find(m => m.id === id)?.price || 0) * q, 0);

  function add(id: string) { setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 })); }
  function dec(id: string) { setCart(c => { const n = { ...c }; n[id] = (n[id] || 0) - 1; if (n[id] <= 0) delete n[id]; return n; }); }

  async function place() {
    if (!table) return alert('Open this page from a table QR so the table number is known.');
    if (!count) return alert('Your cart is empty.');
    setError('');
    try {
      const items = Object.entries(cart).map(([menuItemId, quantity]) => ({ menuItemId, quantity }));
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, items, note }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not place order');
      setDone(data.order); setCart({}); setShow(false); setNote('');
    } catch (e: any) { setError(e.message); }
  }

  return <main>
    <header className="header"><div className="header-inner"><div><div className="brand">☕ Café Buddy's Espresso</div><div className="subtle">Kharadi, Pune</div></div><span className="pill">Table {table || '?'}</span></div></header>
    <div className="container">
      <section className="hero"><h1>Order from your table</h1><p>Scan, order, relax. We'll bring it to you.</p></section>
      {error && <div className="success" style={{ marginBottom: 16 }}>{error}</div>}
      {loading ? <div className="card">Loading the live menu…</div> : <>
        <div className="tabs">{categories.map(c => <button key={c} onClick={() => setCat(c)} className={cat === c ? 'active' : ''}>{c}</button>)}</div>
        <div className="grid">{list.map(m => <article key={m.id} className="card"><div style={{ fontSize: 34 }}>{m.category.includes('Coffee') ? '☕' : m.category.includes('Dessert') ? '🍰' : '🍽️'}</div><h3>{m.name}</h3><p className="muted">{m.description}</p><div className="row"><span className="price">₹{m.price}</span><button className="btn" onClick={() => add(m.id)}>Add</button></div></article>)}</div>
      </>}
    </div>
    {count > 0 && <button className="btn fixed-cart" onClick={() => setShow(true)}>🛒 Cart · {count} · ₹{total.toFixed(0)}</button>}
    {show && <div className="modal-backdrop" onClick={() => setShow(false)}><div className="sheet" onClick={e => e.stopPropagation()}><div className="row"><h2>Your order</h2><button className="btn secondary" onClick={() => setShow(false)}>Close</button></div>{Object.entries(cart).map(([id, qty]) => { const m = menu.find(x => x.id === id)!; return <div className="row" style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }} key={id}><div><b>{m.name}</b><div className="muted">₹{m.price} × {qty}</div></div><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><button className="btn secondary" onClick={() => dec(id)}>−</button><span>{qty}</span><button className="btn" onClick={() => add(id)}>+</button></div></div> })}<div style={{ marginTop: 14 }}><label className="label">Special instructions</label><textarea className="textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="Less sugar, no onions, etc." /></div><div className="row" style={{ margin: '16px 0' }}><b>Total</b><b>₹{total.toFixed(0)}</b></div><button className="btn" style={{ width: '100%' }} onClick={place}>Place order</button></div></div>}
    {done && <div className="modal-backdrop"><div className="sheet"><h2>🎉 Order received</h2><p>Order <b>#{done.id.slice(0, 8)}</b> · Table {table}</p><div className="success">Estimated preparation time: <b>{done.eta_minutes}–{done.eta_minutes + 5} minutes</b></div><p className="muted">Your order has been sent to the café kitchen.</p><button className="btn" onClick={() => setDone(null)}>Back to menu</button></div></div>}
  </main>;
}