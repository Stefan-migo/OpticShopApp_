import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers'; // No longer needed
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'; // No longer needed

export async function GET(request: Request) {
  console.log('/api/tenants - Entering GET route.'); // Debugging log

  // Create a Supabase client with the service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('/api/tenants - Supabase URL defined:', !!supabaseUrl); // Debugging log
  console.log('/api/tenants - Service Role Key defined:', !!serviceRoleKey); // Debugging log


  if (!supabaseUrl || !serviceRoleKey) {
      console.error('/api/tenants - Missing Supabase URL or Service Role Key.'); // Debugging log
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const supabaseServiceRole = createClient(
    supabaseUrl,
    serviceRoleKey
  );

  // Get the access token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  console.log('/api/tenants - Authorization header:', authHeader ? 'Present' : 'Missing'); // Debugging log
  console.log('/api/tenants - Token extracted:', !!token); // Debugging log


  if (!token) {
      console.warn('/api/tenants - Unauthorized access attempt: No token provided.'); // Debugging log
      return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
  }

  // Verify the token and get the user ID using the service role client
  const { data: userData, error: userError } = await supabaseServiceRole.auth.getUser(token);

  console.log('/api/tenants - User data from token verification:', userData); // Debugging log
  console.log('/api/tenants - User error from token verification:', userError); // Debugging log


  if (userError || !userData?.user) {
    console.warn('/api/tenants - Unauthorized access attempt: Invalid token.'); // Debugging log
    return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
  }

  // Fetch the user's profile to check for superuser status using the user ID
  const { data: profileData, error: profileError } = await supabaseServiceRole
    .from('profiles')
    .select('is_superuser')
    .eq('id', userData.user.id)
    .single();

  console.log('/api/tenants - Profile data for superuser check:', profileData); // Debugging log
  console.log('/api/tenants - Profile error for superuser check:', profileError); // Debugging log


  if (profileError || !profileData?.is_superuser) {
    console.warn('/api/tenants - Forbidden access attempt (not superuser or profile error).'); // Debugging log
    // Return 403 if not superuser or if there was a profile error
    return NextResponse.json({ error: 'Forbidden: Not a superuser or profile fetch failed.' }, { status: 403 });
  }

  try {
    console.log('/api/tenants - User is superuser, fetching tenants with service role client...'); // Debugging log
    // Fetch all tenants using the service role client (bypasses RLS)
    const { data: tenants, error } = await supabaseServiceRole
      .from('tenants')
      .select('*');

    console.log('/api/tenants - Supabase query error:', error); // Debugging log


    if (error) {
      console.error('/api/tenants - Error fetching tenants with service role:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('/api/tenants - Successfully fetched tenants.'); // Debugging log
    return NextResponse.json(tenants);

  } catch (error: any) {
    console.error('/api/tenants - Unexpected error fetching tenants:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
