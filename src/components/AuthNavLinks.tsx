'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Locale } from '@/lib/i18n/config';

interface AuthNavLinksProps {
  lang: Locale;
  loginText: string;
  signUpText: string;
  dashboardText: string;
}

const AuthNavLinks: React.FC<AuthNavLinksProps> = ({ lang, loginText, signUpText, dashboardText }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    // Optional: Subscribe to auth state changes for real-time updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (session) {
    return (
      <Link href={`/${lang}/dashboard`}>
        <Button
          className="bg-muted text-muted-foreground px-6 py-2 rounded-full shadow-neumorphic-sm hover:shadow-neumorphic transition-all duration-300"
        >
          {dashboardText}
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Link href={`/login`}>
        <Button
          variant="outline"
          className="text-text-primary hover:bg-element-bg/10 hover:text-text-primary border-border"
        >
          {loginText}
        </Button>
      </Link>
      <Link href={`/${lang}/signup`}>
        <Button
          className="bg-muted text-muted-foreground px-6 py-2 rounded-full shadow-neumorphic-sm hover:shadow-neumorphic transition-all duration-300"
        >
          {signUpText}
        </Button>
      </Link>
    </>
  );
};

export default AuthNavLinks;
