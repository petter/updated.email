"use client";

import { useState, useTransition } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { unsubscribeAction } from "../unsubscribe-action";

export function UnsubscribeButton() {
  const [state, setState] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUnsubscribe = () => {
    if (
      !confirm(
        "Are you sure you want to unsubscribe from updated.email newsletters?",
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await unsubscribeAction();
      setState({
        success: result.success,
        message: result.success ? result.message : undefined,
        error: result.success ? undefined : result.error,
      });
    });
  };

  return (
    <div className="space-y-4">
      {state?.success === true && (
        <Alert className="border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/30 dark:text-green-100">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state?.success === false && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button
        variant="destructive"
        onClick={handleUnsubscribe}
        disabled={isPending}
      >
        {isPending ? "Unsubscribing..." : "Unsubscribe from newsletters"}
      </Button>
    </div>
  );
}
