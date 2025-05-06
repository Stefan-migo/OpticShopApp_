"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";

// Define the form schema for profile editing
const profileFormSchema = z.object({
  full_name: z.string().min(1, { message: "Full name cannot be empty." }).optional(),
  // Add other editable fields here later (e.g., avatar_url)
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Define type for fetched profile data
type ProfileData = {
    id: string;
    email: string | null;
    role_name: string | null;
    full_name: string | null;
};

export default function ProfilePage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Form definition
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "", // Will be populated by useEffect
    },
    mode: "onChange", // Validate on change
  });

  // Fetch user and profile data
  const fetchUserData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error("User not found.");

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            roles ( name )
        `)
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const roleName = (profileData?.roles && typeof profileData.roles === 'object' && !Array.isArray(profileData.roles))
          ? (profileData.roles as { name: string | null }).name
          : null;

      const fetchedProfile: ProfileData = {
          id: user.id,
          email: user.email ?? null,
          role_name: roleName || 'No Role Assigned',
          full_name: profileData?.full_name ?? null,
      };

      setProfile(fetchedProfile);
      // Reset form with fetched data
      form.reset({
          full_name: fetchedProfile.full_name || "",
      });

    } catch (err: any) {
      console.error("Error fetching profile data:", err);
      setError(err.message || "Failed to load profile data.");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, form]); // Add form to dependency array for reset

  React.useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // Fetch data on mount

  // Handle profile update
  const onSubmit = async (values: ProfileFormValues) => {
    if (!profile) return;
    try {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                full_name: values.full_name || null, // Handle empty string
                updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

        if (updateError) throw updateError;

        toast({ title: "Profile updated successfully." });
        // Optionally re-fetch data to confirm update, though state should reflect change
        fetchUserData();

    } catch (err: any) {
        console.error("Error updating profile:", err);
        toast({
            title: "Error updating profile",
            description: err.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>View and update your account details.</CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                {isLoading ? (
                    <p className="text-muted-foreground">Loading profile...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : profile ? (
                    <>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{profile.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Role:</span>
                        <Badge variant={profile.role_name === 'admin' ? 'destructive' : 'secondary'} className="capitalize">
                        {profile.role_name}
                        </Badge>
                    </div>
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your full name" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </>
                ) : (
                    <p className="text-muted-foreground">Could not load profile.</p>
                )}
                </CardContent>
                {profile && !isLoading && (
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                )}
            </form>
        </Form>
      </Card>

      {/* TODO: Add Password Change Section */}
      <Card>
         <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your account password.</CardDescription>
         </CardHeader>
         <CardContent>
            <p className="text-sm text-muted-foreground">Password change functionality coming soon...</p>
            {/* Add password change form here */}
         </CardContent>
      </Card>
    </div>
  );
}
