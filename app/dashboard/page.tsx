import { ConvexHttpClient } from "convex/browser";
import Image from "next/image";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";
import { getAuthenticatedEmail, getSessionId } from "@/lib/auth";
import { SiteFooter } from "../site-footer";
import { LoginForm } from "./login-form";
import { LogoutButton } from "./logout-button";
import { PostHogIdentify } from "./posthog-identify";
import { SubscribedPackages } from "./subscribed-packages";
import { UnsubscribeButton } from "./unsubscribe-button";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { verified, error } = params;
  const isVerified = verified === "true";
  const errorMessage = typeof error === "string" ? error : undefined;
  const email = await getAuthenticatedEmail();
  const sessionId = await getSessionId();

  // Get unsubscribe token if user is authenticated
  let unsubscribeToken: string | null = null;
  if (email && sessionId) {
    try {
      const tokenResult = await convex.mutation(
        api.subscriptions.generateUnsubscribeToken,
        {
          email,
          sessionId,
        },
      );
      if (tokenResult.success) {
        unsubscribeToken = tokenResult.token ?? null;
      }
    } catch (error) {
      console.error("Failed to generate unsubscribe token:", error);
    }
  }

  // If not authenticated, show login form
  if (!email) {
    return (
      <main className="min-h-screen bg-background px-6 py-16">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <header className="text-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-3 mb-6"
            >
              <Image
                src="/logo.svg"
                alt="updated.email logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="uppercase tracking-wide text-muted-foreground font-medium text-lg">
                updated.email
              </span>
            </Link>
            <p className="text-lg text-muted-foreground">
              Sign in to manage your package subscriptions
            </p>
          </header>
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <LoginForm />
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to home
            </Link>
          </div>
          <SiteFooter />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <PostHogIdentify email={email} />
      <div className="mx-auto w-full max-w-6xl space-y-12">
        {isVerified && (
          <Alert className="border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/30 dark:text-green-100">
            <AlertTitle>Subscription Confirmed!</AlertTitle>
            <AlertDescription>
              Thank you for verifying your email address. You are now subscribed
              to weekly updates.
            </AlertDescription>
          </Alert>
        )}
        {/* Header */}
        <header className="flex items-start justify-between">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.svg"
                alt="updated.email logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="uppercase tracking-wide text-muted-foreground font-medium">
                updated.email
              </span>
            </Link>
            <p className="text-lg text-muted-foreground">
              Manage your subscription
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed in as {email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LogoutButton />
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to home
            </Link>
          </div>
        </header>

        {/* Subscribed Packages Section */}
        {sessionId && (
          <SubscribedPackages email={email} sessionId={sessionId} />
        )}

        {/* Subscription Management Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              Newsletter Subscription
            </h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manage Newsletter</CardTitle>
              <CardDescription>
                You are currently subscribed to receive weekly updates. You can
                unsubscribe at any time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnsubscribeButton token={unsubscribeToken} />
            </CardContent>
          </Card>
        </section>
        <SiteFooter />
      </div>
    </main>
  );
}
