"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// TODO: Add Form components if implementing profile editing

export default function ProfilePage() {
  const supabase = createClient();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw userError || new Error("User not found.");
        setUserEmail(user.email ?? 'N/A');

        // Fetch profile to get role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('roles ( name )')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle for robustness

        if (profileError) throw profileError;

        const roleName = (profileData?.roles && typeof profileData.roles === 'object' && !Array.isArray(profileData.roles))
            ? (profileData.roles as { name: string | null }).name
            : null;
        setUserRole(roleName || 'No Role Assigned');

      } catch (err: any) {
        console.error("Error fetching profile data:", err);
        setError(err.message || "Failed to load profile data.");
        setUserEmail('Error');
        setUserRole('Error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [supabase]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground">Loading profile...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{userEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role:</span>
                <Badge variant={userRole === 'admin' ? 'destructive' : 'secondary'} className="capitalize">
                  {userRole}
                </Badge>
              </div>
              {/* TODO: Add form here to edit profile fields like full_name */}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
