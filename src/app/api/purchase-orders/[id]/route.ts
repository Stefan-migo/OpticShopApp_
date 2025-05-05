import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id } = params;

  try {
    const { data: purchaseOrder, error } = await supabase
      .from('purchase_orders')
      .select('*, purchase_order_items(*)') // Select purchase order and related items
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching purchase order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    return NextResponse.json(purchaseOrder);

  } catch (error: any) {
    console.error('Unexpected error fetching purchase order:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id } = params;
  const updates = await request.json();

  try {
    // Note: Handling updates for nested items requires more complex logic
    // This example only updates the main purchase order fields
    const { data: updatedPurchaseOrder, error } = await supabase
      .from('purchase_orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating purchase order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

     if (!updatedPurchaseOrder) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }


    return NextResponse.json({ message: 'Purchase order updated successfully', updatedPurchaseOrder });

  } catch (error: any) {
    console.error('Unexpected error updating purchase order:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id } = params;

  try {
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting purchase order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Purchase order deleted successfully' });

  } catch (error: any) {
    console.error('Unexpected error deleting purchase order:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
