import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function UnsubscribedPage(
  props: PageProps<"/unsubscribed">,
) {
  const searchParams = await props.searchParams;
  const error =
    typeof searchParams.error === "string" ? searchParams.error : undefined;
  const hasError = Boolean(error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {hasError ? (
          <Alert variant="destructive">
            <AlertTitle>Unsubscribe Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/30 dark:text-green-100">
            <AlertTitle>Successfully Unsubscribed</AlertTitle>
            <AlertDescription>
              You have been unsubscribed from updated.email newsletters. We're
              sorry to see you go!
            </AlertDescription>
          </Alert>
        )}
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
