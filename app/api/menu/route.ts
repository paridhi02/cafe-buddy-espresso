import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../lib/supabase';

export async function GET() {
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  const { data, error } = await db.from('menu_items').select('id,name,description,price,prep_minutes,available,menu_categories(name)').eq('available', true).order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const items = (data || []).map((x: any) => ({ ...x, price: Number(x.price), category: x.menu_categories?.name || 'Menu' }));
  return NextResponse.json({ items });
}