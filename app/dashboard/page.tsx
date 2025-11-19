import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthenticatedEmail } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { LogoutButton } from "./logout-button";
import { SubscribedPackages } from "./subscribed-packages";
import { UnsubscribeButton } from "./unsubscribe-button";

// Dummy data for previous emails
const previousEmails = [
  {
    id: "1",
    subject: "Weekly Update: React 19.2.0 Released",
    sentAt: "2024-01-20T10:00:00Z",
    packages: ["react"],
    preview:
      "React 19.2.0 has been released with performance improvements and bug fixes...",
  },
  {
    id: "2",
    subject: "Weekly Update: Next.js 16.0.3 & TypeScript 5.6.3",
    sentAt: "2024-01-19T10:00:00Z",
    packages: ["next", "typescript"],
    preview:
      "This week brings updates to Next.js and TypeScript with new features...",
  },
  {
    id: "3",
    subject: "Weekly Update: Tailwind CSS 4.0.0 Released",
    sentAt: "2024-01-17T10:00:00Z",
    packages: ["tailwindcss"],
    preview: "Tailwind CSS 4.0.0 is now available with major improvements...",
  },
  {
    id: "4",
    subject: "Weekly Update: All Packages",
    sentAt: "2024-01-15T10:00:00Z",
    packages: ["react", "next", "typescript", "tailwindcss"],
    preview: "Your weekly digest of updates across all subscribed packages...",
  },
];

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
              to updated.email.
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
              Manage your package subscriptions and view email history
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
                You are currently subscribed to updated.email newsletters. You
                can unsubscribe at any time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnsubscribeButton />
            </CardContent>
          </Card>
        </section>

        {/* Subscribed Packages Section */}
        <SubscribedPackages email={email} />

        {/* Previous Emails Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
              Previous Emails
            </h2>
            <Badge variant="outline">{previousEmails.length} emails</Badge>
          </div>
          <div className="space-y-4">
            {previousEmails.map((email) => (
              <Card
                key={email.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{email.subject}</CardTitle>
                      <CardDescription className="mt-2">
                        {email.preview}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDateTime(email.sentAt)}
                    </span>
                    <span className="text-neutral-400 dark:text-neutral-600">
                      •
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {email.packages.map((pkg) => (
                        <Badge key={pkg} variant="outline" className="text-xs">
                          {pkg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
