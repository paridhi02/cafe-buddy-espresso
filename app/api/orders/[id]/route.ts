import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../../lib/supabase';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Database is not configured yet.' }, { status: 503 });
  const { data, error } = await db.from('orders').select('*, order_items(*)').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}