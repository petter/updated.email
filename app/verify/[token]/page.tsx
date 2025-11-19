import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  try {
    const result = await convex.mutation(api.subscriptions.verify, { token });

    if (result.success) {
      redirect("/dashboard?verified=true");
    } else {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {result.message || "Invalid or expired token."}
          </p>
        </div>
      );
    }
  } catch (error) {
      // If redirect throws (which it does in Next.js), let it pass
      if (isRedirectError(error)) {
          throw error;
      }
    console.error("Verification failed", error);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Something went wrong. Please try again.
        </p>
      </div>
    );
  }
}

function isRedirectError(error: any) {
  return error?.digest?.startsWith("NEXT_REDIRECT");
}

