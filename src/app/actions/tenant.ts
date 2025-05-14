"use server";

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper function to create Supabase client with service role key
function createClientWithServiceRole() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Assuming this env var name

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase URL or Service Role Key environment variables.");
    return null;
  }

  // Use createServerClient with service role key
  return createServerClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          const cookieStore = await cookies();
          cookieStore.set({ name, value, ...options });
        },
        async remove(name: string, options: any) {
          const cookieStore = await cookies();
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}


export async function updateTenantClaim(selectedTenantId: string) {
  console.log("updateTenantClaim Server Action called with selectedTenantId:", selectedTenantId); // Log start

  const supabaseServiceRole = createClientWithServiceRole();

  if (!supabaseServiceRole) {
    console.error("updateTenantClaim - Failed to create Supabase client with service role."); // Log error
    return { success: false, error: "Internal server error." };
  }

  console.log("updateTenantClaim - Attempting to get authenticated user."); // Log before getUser
  // Get the current authenticated user's ID
  const { data: { user }, error: userError } = await supabaseServiceRole.auth.getUser();
  console.log("updateTenantClaim - getUser result:", { user, userError }); // Log after getUser

  if (userError || !user) {
    console.error("updateTenantClaim - Error getting user:", userError?.message); // Log error
    return { success: false, error: userError?.message || "User not authenticated." };
  }

  try {
    console.log(`updateTenantClaim - Attempting to update user ${user.id} metadata with tenant_id: ${selectedTenantId}`); // Log before update
    // Update user metadata with the selected tenant ID
    const { data: updatedUser, error: updateError } = await supabaseServiceRole.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: {
          ...user.app_metadata, // Keep existing metadata
          tenant_id: selectedTenantId, // Add or update tenant_id claim
        },
      }
    );
    console.log("updateTenantClaim - updateUserById result:", { updatedUser, updateError }); // Log after update

    if (updateError) {
      console.error("updateTenantClaim - Error updating user metadata:", updateError.message); // Log error
      return { success: false, error: updateError.message };
    }

    // The user object returned by updateUserById should contain the updated session
    // Supabase should automatically handle setting the new cookies on the response
    // when this Server Action completes.

    console.log(`updateTenantClaim - Successfully updated user ${user.id} with tenant_id claim: ${selectedTenantId}`); // Log success
    return { success: true };

  } catch (error: any) {
    console.error("updateTenantClaim - An unexpected error occurred:", error); // Log unexpected error
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
