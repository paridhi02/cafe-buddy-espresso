import Link from 'next/link';
import { getServerSupabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function KitchenPage() {
  const db = getServerSupabase();
  let orders: any[] = [];
  let error = '';

  if (!db) {
    error = 'Database connection is not configured.';
  } else {
    const result = await db
      .from('orders')
      .select('id,status,payment_status,total,eta_minutes,created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    orders = result.data || [];
    if (result.error) error = result.error.message;
  }

  return (
    <main>
      <header className="header"><div className="header-inner"><div><div className="brand">☕ Café Buddy&apos;s Espresso — Kitchen</div><div className="subtle">Kharadi, Pune</div></div><Link href="/" className="btn secondary">Home</Link></div></header>
      <div className="container">
        <section className="hero"><h1>Kitchen</h1><p>Incoming orders from the live database.</p></section>
        {error ? <div className="error">{error}</div> : orders.length === 0 ? <div className="card">No orders yet.</div> : <div className="stack">{orders.map(order => <article className="order-card" key={order.id}><div className="row"><div><b>Order #{String(order.id).slice(0, 8)}</b><div className="muted">{new Date(order.created_at).toLocaleString()}</div></div><span className="pill">{order.status}</span></div><div className="row" style={{ marginTop: 12 }}><span>₹{Number(order.total).toFixed(2)}</span><span className="muted">ETA {order.eta_minutes ?? '—'} min · Payment {order.payment_status}</span></div></article>)}</div>}
      </div>
    </main>
  );
}
