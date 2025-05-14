"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Define the expected structure of the user data returned by the action
export type UserForAdmin = {
    id: string;
    full_name: string | null;
    email: string;
    role_id: string | null;
    roles: { id: string; name: string } | null;
};

// Define the return type for fetchUsersForAdmin
export type FetchUsersResult = {
    users: UserForAdmin[];
    roles: { id: string; name: string }[];
};

export async function fetchUsersForAdmin(searchParams?: { [key: string]: string | string[] | undefined }): Promise<FetchUsersResult> {
  const supabase = await createServerClient(); // Use the server client for auth checks

  // Check user authentication and role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated.");
  }

  // Fetch the current user's profile to check their role and get their tenant_id and superuser status
  const { data: currentUserProfileData, error: currentUserProfileError } = await supabase
    .from('profiles')
    .select('roles ( name ), tenant_id, is_superuser')
    .eq('id', user.id)
    .maybeSingle();

  const userRoleName = (currentUserProfileData?.roles && typeof currentUserProfileData.roles === 'object' && !Array.isArray(currentUserProfileData.roles))
    ? (currentUserProfileData.roles as { name: string | null }).name
    : null;

  const userTenantId = currentUserProfileData?.tenant_id;
  const isSuperuser = currentUserProfileData?.is_superuser || false;

  // Server-side authorization check: Only admins and superusers can fetch users
  if (currentUserProfileError || (userRoleName !== 'admin' && !isSuperuser)) {
    throw new Error("Unauthorized access. User is not an admin or superuser.");
  }

  // Determine the tenant ID to use for filtering
  const selectedTenantId = searchParams?.tenantId;
  const filterTenantId = (isSuperuser && selectedTenantId && typeof selectedTenantId === 'string') ? selectedTenantId : userTenantId;

  if (!filterTenantId && !isSuperuser) {
      console.error("Error: Could not determine tenant ID for filtering for non-superuser.");
      throw new Error("Could not determine tenant context.");
  }

  // --- Simplified Data Fetching Approach (Querying only profiles and joining roles) ---

  // Fetch profiles filtered by the determined tenant ID, joining with roles
  let profilesQuery = supabase
    .from('profiles')
    .select(`
        id,
        full_name,
        role_id,
        email,
        roles ( id, name )
    `);

  if (filterTenantId) {
      profilesQuery = profilesQuery.eq('tenant_id', filterTenantId);
  } else if (!isSuperuser) {
       throw new Error("Could not determine tenant context for filtering.");
  }

  const { data: profilesData, error: profilesError } = await profilesQuery;

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
  }

  // Map the fetched data to the desired structure
  const formattedUsers: UserForAdmin[] = profilesData?.map((profile: any) => ({
    id: profile.id,
    full_name: profile.full_name,
    role_id: profile.role_id,
    roles: (profile.roles && typeof profile.roles === 'object' && !Array.isArray(profile.roles))
        ? profile.roles as { id: string; name: string }
        : null,
    email: profile.email || '', // Get email directly from the profiles table
  })) || [];

  // Fetch all roles (still needed for the role change dropdown on the client)
  const { data: rolesData, error: rolesError } = await supabase.from('roles').select('id, name');
  if (rolesError) {
      console.error("Error fetching roles:", rolesError);
      throw new Error(`Failed to fetch roles: ${rolesError.message}`);
  }

  return {
      users: formattedUsers,
      roles: rolesData || []
  };
}

// Server Action to update a user's role
export async function updateUserRole(userId: string, newRoleId: string) {
    const supabase = await createServerClient();

    // Check user authentication and role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated.");
    }

    // Fetch the current user's profile to check their role and tenant_id
    const { data: currentUserProfileData, error: currentUserProfileError } = await supabase
        .from('profiles')
        .select('roles ( name ), tenant_id, is_superuser')
        .eq('id', user.id)
        .maybeSingle();

    const userRoleName = (currentUserProfileData?.roles && typeof currentUserProfileData.roles === 'object' && !Array.isArray(currentUserProfileData.roles))
        ? (currentUserProfileData.roles as { name: string | null }).name
        : null;

    const userTenantId = currentUserProfileData?.tenant_id;
    const isSuperuser = currentUserProfileData?.is_superuser || false;

    // Server-side authorization check: Only admins and superusers can update roles
    if (currentUserProfileError || (userRoleName !== 'admin' && !isSuperuser)) {
        throw new Error("Unauthorized access. User is not an admin or superuser.");
    }

    // Fetch the target user's profile to check their tenant_id
    const { data: targetUserProfileData, error: targetUserProfileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', userId)
        .maybeSingle();

    if (targetUserProfileError || !targetUserProfileData) {
        throw new Error("Target user not found.");
    }

    // Check if the admin/superuser is allowed to update this user's role
    // Tenant admins can only update users within their own tenant.
    // Superusers can update any user.
    if (!isSuperuser && targetUserProfileData.tenant_id !== userTenantId) {
        throw new Error("Unauthorized: Cannot update user from a different tenant.");
    }

    // Validate the new role_id exists in the roles table (optional but recommended)
    const { count: roleCount, error: roleError } = await supabase
        .from('roles')
        .select('*', { count: 'exact', head: true })
        .eq('id', newRoleId);

    if (roleError || roleCount === 0) {
        throw new Error("Invalid role ID provided.");
    }


    // Perform the role update
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role_id: newRoleId })
        .eq('id', userId);

    if (updateError) {
        console.error("Error updating user role:", updateError);
        throw new Error(`Failed to update user role: ${updateError.message}`);
    }

    // Revalidate the path to refresh the user list on the admin page
    // revalidatePath('/[lang]/(app)/users'); // Consider revalidating the specific path if needed
}
