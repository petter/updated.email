import { ConvexHttpClient } from "convex/browser";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";
import { SiteFooter } from "../../site-footer";
import { VerifyTokenForm } from "./verify-token-form";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

interface VerifyPageProps {
  params: Promise<{ token: string }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { token } = await params;
  let resolvedEmail: string | null = null;

  // Try to resolve the email (without consuming the token)
  try {
    const result = await convex.query(
      api.subscriptions.getVerificationTokenEmail,
      {
        token,
      },
    );
    resolvedEmail = result.email ?? null;
  } catch (error) {
    console.error("Failed to resolve token email:", error);
    // If query fails, treat as invalid token
    resolvedEmail = null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
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
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>
              {resolvedEmail
                ? `Click the button below to verify ${resolvedEmail} and activate your subscription.`
                : "Click the button below to verify your email and activate your subscription."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VerifyTokenForm token={token} />
          </CardContent>
        </Card>

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
    </div>
  );
}
