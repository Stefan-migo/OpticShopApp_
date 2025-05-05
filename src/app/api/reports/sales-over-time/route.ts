import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data, error } = await supabase
      .from('sales_over_time')
      .select('*');

    if (error) {
      console.error('Error fetching sales over time:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
