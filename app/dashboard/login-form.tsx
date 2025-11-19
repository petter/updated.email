"use client";

import { useActionState } from "react";
import { requestLoginAction } from "@/app/login-action";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    requestLoginAction,
    null,
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl border border-neutral-200/80 bg-white/90 p-6 shadow-2xl shadow-neutral-900/5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60 md:p-10"
      aria-label="Sign in to updated.email"
    >
      {state?.success === true && (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state?.success === false && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 text-left">
        <Label htmlFor="email">Email address</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            disabled={isPending}
            className="w-full flex-1"
          />
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? "Sending..." : "Send Login Link"}
          </Button>
        </div>
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        We'll send you a magic link to sign in. No password required.
      </p>
    </form>
  );
}
