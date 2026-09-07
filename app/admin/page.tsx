import Link from 'next/link';
import { getServerSupabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const db = getServerSupabase();
  let items: any[] = [];
  let orders = 0;
  let error = '';

  if (!db) {
    error = 'Database connection is not configured.';
  } else {
    const [menuResult, orderResult] = await Promise.all([
      db.from('menu_items').select('id,name,price,available,prep_minutes').order('name'),
      db.from('orders').select('id', { count: 'exact', head: true })
    ]);
    items = menuResult.data || [];
    orders = orderResult.count || 0;
    if (menuResult.error) error = menuResult.error.message;
    if (orderResult.error) error = orderResult.error.message;
  }

  return (
    <main>
      <header className="header"><div className="header-inner"><div><div className="brand">☕ Café Buddy&apos;s Espresso — Admin</div><div className="subtle">Kharadi, Pune</div></div><Link href="/" className="btn secondary">Home</Link></div></header>
      <div className="container">
        <section className="hero"><h1>Admin</h1><p>Live overview of menu and orders.</p></section>
        {error ? <div className="error">{error}</div> : <><div className="kpis"><div className="kpi"><span className="muted">Menu items</span><strong>{items.length}</strong></div><div className="kpi"><span className="muted">Orders</span><strong>{orders}</strong></div><div className="kpi"><span className="muted">Available items</span><strong>{items.filter(x => x.available).length}</strong></div></div><div className="card" style={{ marginTop: 16 }}><h2>Menu</h2>{items.length === 0 ? <p className="muted">No menu items have been added to Supabase yet.</p> : <table className="table"><thead><tr><th>Name</th><th>Price</th><th>Prep</th><th>Available</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td>{item.name}</td><td>₹{Number(item.price).toFixed(2)}</td><td>{item.prep_minutes} min</td><td>{item.available ? 'Yes' : 'No'}</td></tr>)}</tbody></table>}</div></>}
      </div>
    </main>
  );
}
