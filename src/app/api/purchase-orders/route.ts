import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { supplier_id, order_date, expected_delivery_date, items } = await request.json();

  try {
    // Insert the new purchase order
    const { data: purchaseOrder, error: poError } = await supabase
      .from('purchase_orders')
      .insert([{ supplier_id, order_date, expected_delivery_date }])
      .select()
      .single();

    if (poError) {
      console.error('Error creating purchase order:', poError);
      return NextResponse.json({ error: poError.message }, { status: 500 });
    }

    if (!purchaseOrder) {
       return NextResponse.json({ error: 'Purchase order creation failed.' }, { status: 500 });
    }

    // Prepare purchase order items for insertion
    const purchaseOrderItems = items.map((item: any) => ({
      purchase_order_id: purchaseOrder.id,
      product_id: item.product_id,
      quantity_ordered: item.quantity_ordered,
      unit_price: item.unit_price,
      line_total: item.quantity_ordered * item.unit_price,
    }));

    // Insert purchase order items
    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(purchaseOrderItems);

    if (itemsError) {
      console.error('Error creating purchase order items:', itemsError);
      // Consider rolling back the purchase order creation here if items insertion fails
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Calculate and update total_amount for the purchase order
    const totalAmount = purchaseOrderItems.reduce((sum: number, item: any) => sum + item.line_total, 0);
     const { error: totalUpdateError } = await supabase
      .from('purchase_orders')
      .update({ total_amount: totalAmount })
      .eq('id', purchaseOrder.id);

    if (totalUpdateError) {
      console.error('Error updating purchase order total amount:', totalUpdateError);
      // This might not be a critical error depending on requirements, but worth logging
    }


    return NextResponse.json({ message: 'Purchase order created successfully', purchaseOrder }, { status: 201 });

  } catch (error: any) {
    console.error('Unexpected error creating purchase order:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabase = createClient();

  try {
    const { data: purchaseOrders, error } = await supabase
      .from('purchase_orders')
      .select('*, suppliers(name)'); // Select purchase orders and join with suppliers to get name

    if (error) {
      console.error('Error fetching purchase orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(purchaseOrders);

  } catch (error: any) {
    console.error('Unexpected error fetching purchase orders:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}

// Add GET, PUT, DELETE handlers in separate files or extend this one
