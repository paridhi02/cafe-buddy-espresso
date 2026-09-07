import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../lib/supabase';

export async function POST(req: Request) {
  const body = await req.json();
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Database is not configured yet.' }, { status: 503 });
  if (!body.table || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Table and items are required.' }, { status: 400 });
  }
  const { data: restaurant } = await db.from('restaurants').select('id').limit(1).single();
  if (!restaurant) return NextResponse.json({ error: 'Restaurant is not configured.' }, { status: 500 });
  const { data: table } = await db.from('cafe_tables').select('id,table_number').eq('restaurant_id', restaurant.id).eq('table_number', Number(body.table)).eq('active', true).single();
  if (!table) return NextResponse.json({ error: 'Invalid table.' }, { status: 400 });

  const ids = body.items.map((x: any) => x.menuItemId);
  const { data: menuItems } = await db.from('menu_items').select('id,name,price,prep_minutes,available').in('id', ids);
  if (!menuItems || menuItems.length !== ids.length || menuItems.some((m: any) => !m.available)) {
    return NextResponse.json({ error: 'One or more items are unavailable.' }, { status: 409 });
  }
  const map = new Map(menuItems.map((m: any) => [m.id, m]));
  let subtotal = 0;
  let eta = 0;
  const rows = body.items.map((x: any) => {
    const m: any = map.get(x.menuItemId);
    const quantity = Math.max(1, Math.min(20, Number(x.quantity)));
    subtotal += Number(m.price) * quantity;
    eta = Math.max(eta, Number(m.prep_minutes) || 5) + quantity * 2;
    return { menu_item_id: m.id, name_snapshot: m.name, unit_price: m.price, quantity, prep_minutes: m.prep_minutes, special_instructions: x.specialInstructions || null };
  });
  eta = Math.min(60, eta + 5);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const { data: order, error } = await db.from('orders').insert({ restaurant_id: restaurant.id, table_id: table.id, status: 'RECEIVED', payment_status: 'PENDING', subtotal, tax, total: subtotal + tax, eta_minutes: eta, customer_note: body.note || null }).select('id,table_id,total,eta_minutes,status,payment_status,created_at').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { error: itemError } = await db.from('order_items').insert(rows.map((r: any) => ({ ...r, order_id: order.id })));
  if (itemError) { await db.from('orders').delete().eq('id', order.id); return NextResponse.json({ error: itemError.message }, { status: 500 }); }
  return NextResponse.json({ order });
}