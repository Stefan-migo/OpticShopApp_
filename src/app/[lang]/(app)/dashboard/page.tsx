//OpticShopApp_/src/app/[lang]/(app)/dashboard/page.tsx


import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import { cookies } from "next/headers";
import DashboardContent from "@/components/DashboardContent";
import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/config";

export default async function DashboardPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const supabase = createServerComponentClient();
  const dictionary = await getDictionary(lang);

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
    <DashboardContent userName={userName} dictionary={dictionary} lang={lang} />
  );
}
