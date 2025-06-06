"use client"; // Make this a Client Component

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Dictionary } from "@/lib/i18n/types"; // Import Dictionary type

interface LoginFormProps extends React.ComponentProps<"div"> {
  email: string;
  password: string;
  isLoading: boolean;
  handleSignIn: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  dictionary: Dictionary;
  lang: "es" | "en";
  setEmail: (email: string) => void; // Added setEmail prop
  setPassword: (password: string) => void; // Added setPassword prop
}

export function LoginForm({
  className,
  email,
  password,
  isLoading,
  handleSignIn,
  dictionary,
  lang,
  setEmail,
  setPassword,
  ...props
}: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-visible bg-muted shadow-neumorphic">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSignIn}> {/* Added onSubmit */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">{dictionary.loginPage.title}</h1>
                <p className="text-balance text-muted-foreground">
                  {dictionary.loginPage.description}
                </p>
              </div>
              <div className="grid gap-2 text-muted-foreground">
                <Label htmlFor="email">{dictionary.loginPage.emailLabel}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={dictionary.loginPage.emailPlaceholder}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center text-muted-foreground">
                  <Label htmlFor="password">{dictionary.loginPage.passwordLabel}</Label>
                  <Link
                    href="#" // TODO: Add actual forgot password link
                    className="ml-auto text-sm underline-offset-2  hover:underline"
                  >
                    {dictionary.loginPage.forgotPasswordLink}
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? dictionary.loginPage.signingInButton : dictionary.loginPage.signInButton}
              </Button>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border after:content-['']"> {/* Added after:content-[''] */}
                <span className="relative z-10 bg-muted px-2 text-muted-foreground">
                  {dictionary.loginPage.orContinueWith}
                </span>
              </div>
              <div className="grid grid-cols-1  gap-2">
                {/* TODO: Add Apple and Meta buttons if needed */}
                <Button variant="secondary" className="bg-accent  w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2"> {/* Added w-4 h-4 and mr-2 */}
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="text-muted-foreground"
                    />
                  </svg>
                  {dictionary.loginPage.loginWithGoogle} {/* Moved text outside sr-only */}
                </Button>
                {/* TODO: Add Meta button if needed */}
              </div>
              <div className="text-center text-muted-foreground text-sm">
                {dictionary.loginPage.noAccountText}{" "}
                <Link href={`/${lang}/signup`} className="underline underline-offset-4">
                  {dictionary.loginPage.signUpLink}
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/login2.png" // TODO: Replace with actual image
              alt={dictionary.loginPage.imageAltText}
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary mt-4"> {/* Added margin top */}
        {dictionary.loginPage.termsAndPrivacyText}{" "}
        <Link href="#">{dictionary.loginPage.termsLinkText}</Link>
        {" "}
        {dictionary.loginPage.andText}{" "}
        <Link href="#">{dictionary.loginPage.privacyLinkText}</Link>
        .
      </div>
    </div>
  );
}
