"use client"; // Needs client-side hooks

"use client";

import * as React from "react";
import { getUserManagementColumns, type UserProfile } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/lib/i18n/dictionary-context";
import { fetchUsersForAdmin, updateUserRole, type FetchUsersResult } from "@/app/actions/users"; // Import Server Actions and types

// Define type for available roles (matches the type returned by fetchUsersForAdmin)
type RoleOption = {
    id: string;
    name: string;
};

// Define props for the page component to receive searchParams
interface AdminUsersPageProps {
    searchParams?: { [key: string]: string | string[] | undefined };
}

export default function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const dictionary = useDictionary();
  const [data, setData] = React.useState<UserProfile[]>([]);
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch user profiles and available roles using the Server Action
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
        // Fetch users and roles using the Server Action, passing searchParams
        const result: FetchUsersResult = await fetchUsersForAdmin(searchParams);
        setData(result.users);
        setRoles(result.roles);

    } catch (err: any) {
        console.error("Error loading user management data:", err);
        // Check if the error is due to unauthorized access from the Server Action
        if (err.message === "Unauthorized access. User is not an admin or superuser.") {
             toast({ title: dictionary.userManagement.accessDeniedTitle, description: dictionary.userManagement.accessDeniedDescription, variant: "destructive" });
             router.push('/dashboard');
        } else {
            setError(err.message || dictionary.userManagement.failedToLoadData);
            setData([]);
            setRoles([]);
        }
    } finally {
        setIsLoading(false);
    }
  }, [toast, router, dictionary, searchParams]); // Add searchParams to dependencies

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler for changing user role using the Server Action
  const handleChangeRole = async (userId: string, newRoleId: string) => {
     try {
        await updateUserRole(userId, newRoleId); // Call the Server Action

        toast({ title: dictionary.userManagement.roleUpdateSuccess });
        fetchData(); // Refresh data
     } catch (err: any) {
         console.error("Error updating role:", err);
         toast({
            title: dictionary.userManagement.roleUpdateErrorTitle,
            description: err.message || dictionary.userManagement.unexpectedError,
            variant: "destructive",
         });
     }
  };

  // Generate columns
  const columns = React.useMemo(
    () => getUserManagementColumns({ availableRoles: roles, onChangeRole: handleChangeRole, dictionary }),
    [roles, dictionary]
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{dictionary.userManagement.title}</h1>
      {/* TODO: Add Invite User button/dialog */}
       {isLoading ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-muted-foreground">
          {dictionary.userManagement.loadingUsers}
        </div>
      ) : error ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-red-600">
          {error}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          filterColumnKey="email"
          filterPlaceholder={dictionary.userManagement.filterEmailPlaceholder}
        />
      )}
    </div>
  );
}
