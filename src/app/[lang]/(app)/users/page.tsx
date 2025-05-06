"use client"; // Needs client-side hooks

import * as React from "react";
import { getUserManagementColumns, type UserProfile } from "./columns"; // Import columns and type
import { DataTable } from "@/components/ui/data-table";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation"; // For redirecting non-admins

// Define type for available roles
type RoleOption = {
    id: string;
    name: string;
};

export default function AdminUsersPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();
  const [data, setData] = React.useState<UserProfile[]>([]);
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch user profiles and available roles
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
        // Check current user's role first (client-side check, RLS is the main guard)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('roles ( name )')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle for robustness

        // Explicitly check the shape of profileData and profileData.roles
        const userRoleName = (profileData?.roles && typeof profileData.roles === 'object' && !Array.isArray(profileData.roles))
            ? (profileData.roles as { name: string | null }).name
            : null;

        if (profileError || userRoleName !== 'admin') {
             toast({ title: "Access Denied", description: "You must be an admin to view this page.", variant: "destructive" });
             router.push('/dashboard');
             return;
        }

        // Fetch all roles
        const { data: rolesData, error: rolesError } = await supabase
            .from('roles')
            .select('id, name');
        if (rolesError) throw rolesError;
        setRoles(rolesData || []);

        // Fetch all profiles with their roles
        // NOTE: This requires admin privileges or specific RLS allowing admins to read all profiles/roles
        // We also need the user's email from the auth.users table. This requires a more complex query or separate fetches.
        // For simplicity now, we fetch profiles+roles, but email will be missing.
        // A better approach might use an Edge Function with service_role key.
        const { data: profilesData, error: usersError } = await supabase
            .from('profiles')
            .select(`
                id,
                role_id,
                roles ( id, name )
            `); // Email needs to be fetched separately or via a view/function

        if (usersError) throw usersError;

        // TODO: Fetch emails from auth.users separately and merge (requires admin API)
        // For now, email will be missing in the table
        // Also apply type checking for roles join here
         const typedProfilesData = profilesData?.map(profile => ({
            ...profile,
            roles: (profile.roles && typeof profile.roles === 'object' && !Array.isArray(profile.roles))
                ? profile.roles as { id: string; name: string }
                : null,
        })) || [];
        setData(typedProfilesData as UserProfile[]);


    } catch (err: any) {
        console.error("Error loading user management data:", err);
        setError(err.message || "Failed to load data.");
        setData([]);
        setRoles([]);
    } finally {
        setIsLoading(false);
    }
  }, [supabase, toast, router]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler for changing user role
  const handleChangeRole = async (userId: string, newRoleId: string) => {
     try {
        const { error } = await supabase
            .from('profiles')
            .update({ role_id: newRoleId })
            .eq('id', userId);

        if (error) throw error;

        toast({ title: "User role updated successfully." });
        fetchData(); // Refresh data
     } catch (err: any) {
         console.error("Error updating role:", err);
         toast({
            title: "Error updating role",
            description: err.message || "An unexpected error occurred.",
            variant: "destructive",
         });
     }
  };

  // Generate columns
  const columns = React.useMemo(
    () => getUserManagementColumns({ availableRoles: roles, onChangeRole: handleChangeRole }),
    [roles] // Re-generate columns if roles change (unlikely but good practice)
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">User Management</h1>
      {/* TODO: Add Invite User button/dialog */}
       {isLoading ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-muted-foreground">
          Loading users...
        </div>
      ) : error ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-red-600">
          {error}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          filterColumnKey="email" // Filtering might not work well without email fetched
          filterPlaceholder="Filter by email..."
        />
      )}
    </div>
  );
}
