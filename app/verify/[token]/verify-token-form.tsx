"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  type VerifyTokenActionResult,
  verifyTokenAction,
} from "./verify-token-action";

interface VerifyTokenFormProps {
  token: string;
}

export function VerifyTokenForm({ token }: VerifyTokenFormProps) {
  const [state, formAction, isPending] = useActionState<
    VerifyTokenActionResult | null,
    FormData
  >(verifyTokenAction, null);

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
      {isPending ? "Verifying..." : "Verify Email"}
    </Button>
  );
}
