import Link from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>Café Buddy&apos;s Espresso</h1>
        <p>QR ordering · Kharadi, Pune</p>
        <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href={{ pathname: '/customer', query: { table: '1' } }} className="btn">
            Open customer menu
          </Link>
          <Link href={{ pathname: '/kitchen' }} className="btn secondary">
            Kitchen
          </Link>
          <Link href={{ pathname: '/admin' }} className="btn secondary">
            Admin
          </Link>
        </div>
      </section>
      <div className="grid">
        <div className="card"><h3>Customer</h3><p className="muted">Scan a table QR, browse the menu, order and track preparation time.</p></div>
        <div className="card"><h3>Kitchen</h3><p className="muted">See incoming orders and advance them through the kitchen workflow.</p></div>
        <div className="card"><h3>Admin</h3><p className="muted">Manage menu availability, tables and view a basic order summary.</p></div>
      </div>
    </main>
  );
}
