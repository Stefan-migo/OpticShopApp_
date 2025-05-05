import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import { cookies } from "next/headers";
import DashboardContent from "@/components/DashboardContent";

export default async function DashboardPage() {
  const supabase = createServerComponentClient();

  const { data: { user } } = await supabase.auth.getUser();

  let userName: string | null = null;
  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
    } else {
      userName = profile?.full_name ?? null;
    }
  }

  // The main layout handles redirection for unauthenticated users,
  // so we can assume a user exists here if the page is rendered.
  // However, passing null for userName is safe if profile fetching fails.

  return (
    <DashboardContent userName={userName} />
  );
}
