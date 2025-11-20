import { ConvexHttpClient } from "convex/browser";
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
import { LoginForm } from "./login-form";
import { LogoutButton } from "./logout-button";
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
      <main className="min-h-screen bg-linear-to-b from-neutral-50 via-white to-neutral-100 px-6 py-16 dark:from-neutral-950 dark:via-black dark:to-neutral-950">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <header className="text-center">
            <h1 className="text-4xl font-semibold text-neutral-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-300">
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
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-neutral-50 via-white to-neutral-100 px-6 py-16 dark:from-neutral-950 dark:via-black dark:to-neutral-950">
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
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-neutral-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-300">
              Manage your package subscriptions
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Signed in as {email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LogoutButton />
            <Link
              href="/"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
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
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
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
      </div>
    </main>
  );
}
