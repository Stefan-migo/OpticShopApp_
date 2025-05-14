import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers'; // Import cookies helper

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  try {
    const { data: purchaseOrder, error } = await supabase
      .from('purchase_orders')
      .select('*, suppliers(name), purchase_order_items(*, products(name))') // Select purchase order, join suppliers and purchase_order_items, and join products within items
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
  const supabase = await createClient();
  const { id } = params;
  const updates = await request.json();

  // Get the tenant_id from the cookie
  const cookieStore = await cookies();
  const tenantId = cookieStore.get('tenant_id')?.value;

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID not found in session.' }, { status: 400 });
  }

  try {
    // Separate purchase order data from items (frontend sends 'items')
    const { items: updatedItems, ...restOfUpdates } = updates;

    // Create a copy of the updates and remove the items property
    const purchaseOrderUpdates = { ...restOfUpdates };
    // Ensure 'items' is not present in the update object for 'purchase_orders' table
    if ('items' in purchaseOrderUpdates) {
        delete purchaseOrderUpdates.items;
    }


    // Update the main purchase order fields
    const { data: updatedPurchaseOrders, error: poError } = await supabase
      .from('purchase_orders')
      .update({ ...purchaseOrderUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(); // Removed .single()

    if (poError) {
      console.error('Error updating purchase order:', poError);
      return NextResponse.json({ error: poError.message }, { status: 500 });
    }

    // Check if any rows were updated
    if (!updatedPurchaseOrders || updatedPurchaseOrders.length === 0) {
      return NextResponse.json({ error: 'Purchase order not found or not updated' }, { status: 404 });
    }

    const updatedPurchaseOrder = updatedPurchaseOrders[0]; // Get the updated row

    // --- Handle Purchase Order Items ---

    // Get existing items for this purchase order
    const { data: existingItems, error: fetchItemsError } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', id);

    if (fetchItemsError) {
      console.error('Error fetching existing purchase order items:', fetchItemsError);
      return NextResponse.json({ error: fetchItemsError.message }, { status: 500 });
    }

    const existingItemIds = new Set(existingItems.map(item => item.id));
    const updatedItemIds = new Set(updatedItems.map((item: any) => item.id).filter((id: string | undefined) => id)); // Filter out items without IDs (new items)

    // Items to delete (exist in DB but not in updated list)
    const itemsToDelete = existingItems.filter(item => !updatedItemIds.has(item.id));

    if (itemsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('purchase_order_items')
        .delete()
        .in('id', itemsToDelete.map(item => item.id));

      if (deleteError) {
        console.error('Error deleting purchase order items:', deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    // Items to insert or update
    for (const item of updatedItems) {
      if (item.id && existingItemIds.has(item.id)) {
        // Update existing item
        // Calculate line_total before updating
        const line_total = item.quantity_ordered * item.unit_price;
        const { error: updateItemError } = await supabase
          .from('purchase_order_items')
          .update({ ...item, line_total, updated_at: new Date().toISOString(), tenant_id: tenantId }) // Include tenant_id in update
          .eq('id', item.id);

        if (updateItemError) {
          console.error('Error updating purchase order item:', updateItemError);
          return NextResponse.json({ error: updateItemError.message }, { status: 500 });
        }
      } else {
        // Insert new item
         // Calculate line_total before inserting
        const line_total = item.quantity_ordered * item.unit_price;
        const { error: insertItemError } = await supabase
          .from('purchase_order_items')
          .insert({ ...item, purchase_order_id: id, line_total, tenant_id: tenantId }); // Ensure purchase_order_id, line_total, and tenant_id are set

        if (insertItemError) {
          console.error('Error inserting purchase order item:', insertItemError);
          return NextResponse.json({ error: insertItemError.message }, { status: 500 });
        }
      }
    }

    // --- Recalculate and Update Total Amount ---
    // Fetch the updated items to ensure accurate total calculation
    const { data: updatedItemsForTotal, error: fetchUpdatedItemsError } = await supabase
      .from('purchase_order_items')
      .select('line_total')
      .eq('purchase_order_id', id);

    if (fetchUpdatedItemsError) {
      console.error('Error fetching updated purchase order items for total calculation:', fetchUpdatedItemsError);
      // Log the error but don't necessarily return a 500, as the items were updated
    } else {
      const newTotalAmount = (updatedItemsForTotal || []).reduce((sum: number, item: any) => sum + item.line_total, 0);

      const { error: totalUpdateError } = await supabase
        .from('purchase_orders')
        .update({ total_amount: newTotalAmount })
        .eq('id', id);

      if (totalUpdateError) {
        console.error('Error updating purchase order total amount after item changes:', totalUpdateError);
        // Log the error but don't necessarily return a 500
      }
    }


    return NextResponse.json({ message: 'Purchase order updated successfully', updatedPurchaseOrder });

  } catch (error: any) {
    console.error('Unexpected error updating purchase order:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
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
