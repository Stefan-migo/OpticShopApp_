"use client"; // Make this a Client Component

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useParams } from 'next/navigation'; // Import useParams
import Cookies from 'js-cookie'; // Import js-cookie
import { i18n } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n'; // Import getDictionary
import { Dictionary } from '@/lib/i18n/types'; // Import Dictionary type


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const params = useParams();
  const lang = params.lang as "es" | "en"; // Explicitly type lang
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [isLoadingDictionary, setIsLoadingDictionary] = useState(true); // State for dictionary loading
  const [errorLoadingDictionary, setErrorLoadingDictionary] = useState<string | null>(null); // State for dictionary loading error
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDictionary() {
      setIsLoadingDictionary(true);
      setErrorLoadingDictionary(null);
      try {
        // Use the explicitly typed lang, falling back to defaultLocale if needed
        const localeToUse = i18n.locales.includes(lang) ? lang : i18n.defaultLocale;
        const dict = await getDictionary(localeToUse);
        setDictionary(dict);
      } catch (error) {
        console.error("Error loading dictionary:", error);
        setErrorLoadingDictionary("Failed to load language resources.");
      } finally {
        setIsLoadingDictionary(false);
      }
    }

    fetchDictionary();
  }, [lang]); // Refetch dictionary if lang changes


  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      if (dictionary) { // Add null check for dictionary
        toast({
          title: dictionary.loginPage.toast.loginErrorTitle,
          description: error.message,
          variant: "destructive",
        });
      } else {
         // Fallback toast if dictionary is not loaded
         toast({
           title: "Login Error",
           description: error.message,
           variant: "destructive",
         });
      }
    } else {
      if (dictionary) { // Add null check for dictionary
        toast({
          title: dictionary.loginPage.toast.loginSuccessTitle,
          description: dictionary.loginPage.toast.loginSuccessDescription,
        });
      } else {
         // Fallback toast if dictionary is not loaded
         toast({
           title: "Login Successful",
           description: "You have been successfully logged in.",
         });
      }
      // Redirect to the dashboard or home page upon successful login
      // Use router.refresh() to ensure server components re-render with new auth state
      router.refresh();
      console.log('Login Page - Redirecting with lang:', lang); // Added logging

      let localeToUse: "es" | "en" = lang; // Explicitly type localeToUse

      // If locale from params is undefined (though with middleware it should be set),
      // or if it's not a valid locale, try to get it from the cookie
      if (!i18n.locales.includes(localeToUse)) {
        const preferredLocale = Cookies.get('NEXT_LOCALE');
        console.log('Login Page - Preferred locale from cookie:', preferredLocale); // Added logging

        if (preferredLocale && i18n.locales.includes(preferredLocale as any)) {
          localeToUse = preferredLocale as "es" | "en"; // Use preferred locale from cookie if valid and cast
          console.log('Login Page - Using preferred locale from cookie:', localeToUse); // Added logging
        } else {
          // If cookie not set or invalid, fall back to the default locale
          localeToUse = i18n.defaultLocale;
          console.log('Login Page - Falling back to default locale:', localeToUse); // Added logging
        }
      }

      router.push(`/${localeToUse}/dashboard`); // Redirect to the new dashboard route with determined locale
    }
  };

  // --- Guard Clause: Render loading or error state while dictionary is fetching ---
  if (isLoadingDictionary) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-card">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Loading...</CardTitle>
            <CardDescription>Fetching language resources.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* Optional: Add a spinner or progress indicator here */}
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (errorLoadingDictionary) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-card">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Error</CardTitle>
            <CardDescription>{errorLoadingDictionary}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="text-center text-red-600">Could not load language resources.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dictionary) {
     // Fallback if somehow loading finished but dictionary is still null (shouldn't happen with proper logic)
     console.warn("Dictionary finished loading but is null in Login Page.");
     return (
       <div className="flex items-center justify-center min-h-screen bg-card">
         <Card className="w-full max-w-sm">
           <CardHeader>
             <CardTitle className="text-2xl">Error</CardTitle>
             <CardDescription>Could not load language resources.</CardDescription>
           </CardHeader>
           <CardContent className="grid gap-4">
             <div className="text-center text-orange-500">An unexpected error occurred.</div>
           </CardContent>
         </Card>
       </div>
     );
  }
  // --- End of Guard Clause ---


  return (
    <div className="flex items-center justify-center min-h-screen bg-card">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{dictionary.loginPage.title}</CardTitle>
          <CardDescription>
            {dictionary.loginPage.description}
          </CardDescription>
        </CardHeader>
        {/* Bind form submission to handleSignIn */}
        <form onSubmit={handleSignIn}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{dictionary.loginPage.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={dictionary.loginPage.emailPlaceholder}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{dictionary.loginPage.passwordLabel}</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? dictionary.loginPage.signingInButton : dictionary.loginPage.signInButton}
            </Button>
            <p className="mt-4 text-xs text-center text-muted-foreground">
              {dictionary.loginPage.noAccountText}{" "}
            <Link href={`/${lang}/signup`} className="underline">
              {dictionary.loginPage.signUpLink}
            </Link>
          </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
