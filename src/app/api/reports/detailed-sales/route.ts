import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { searchParams } = new URL(request.url);
    const isSuperuser = searchParams.get('is_superuser') === 'true';
    const selectedTenantId = searchParams.get('selected_tenant_id');

    let query = supabase
      .from('detailed_sales')
      .select('*');

    // Apply tenant filter if superuser and a tenant is selected via query params
    if (isSuperuser && selectedTenantId) {
      query = query.eq('tenant_id', selectedTenantId);
    }
    // Note: For non-superusers or when no selected_tenant_id is provided, RLS policies will handle tenant isolation

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching detailed sales:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
