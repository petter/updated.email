"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  type LoginTokenActionResult,
  loginTokenAction,
} from "./login-token-action";

interface LoginTokenFormProps {
  token: string;
}

export function LoginTokenForm({ token }: LoginTokenFormProps) {
  const [state, formAction, isPending] = useActionState<
    LoginTokenActionResult | null,
    FormData
  >(loginTokenAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state?.success === false && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <SubmitButton isPending={isPending} />
    </form>
  );
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full">
      {isPending ? "Signing in..." : "Sign in"}
    </Button>
  );
}
