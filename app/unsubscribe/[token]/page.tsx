import { ConvexHttpClient } from "convex/browser";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexHttpClient(convexUrl);

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  try {
    const result = await convex.mutation(api.subscriptions.unsubscribe, {
      token,
    });

    if (result.success) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <Alert className="border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/30 dark:text-green-100">
              <AlertTitle>Successfully Unsubscribed</AlertTitle>
              <AlertDescription>
                You have been unsubscribed from updated.email newsletters. We're
                sorry to see you go!
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <Alert variant="destructive">
              <AlertTitle>Unsubscribe Failed</AlertTitle>
              <AlertDescription>
                {result.message || "Invalid or expired unsubscribe link."}
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      );
    }
  } catch (error) {
    // If redirect throws (which it does in Next.js), let it pass
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Unsubscribe failed", error);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Alert variant="destructive">
            <AlertTitle>Unsubscribe Failed</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again or contact support.
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
