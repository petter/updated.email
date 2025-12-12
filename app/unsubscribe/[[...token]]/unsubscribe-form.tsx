"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unsubscribeAction } from "./unsubscribe-action";

interface UnsubscribeFormProps {
  token: string | null;
  email: string | null;
}

export function UnsubscribeForm({ token, email }: UnsubscribeFormProps) {
  return (
    <form action={unsubscribeAction} className="space-y-4">
      {token && <input type="hidden" name="token" value={token} />}
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          readOnly={email !== null}
          value={email ?? ""}
          placeholder="you@company.com"
          className={email !== null ? "bg-muted" : ""}
        />
        {email !== null && (
          <p className="text-xs text-muted-foreground">
            This email was found using your unsubscribe link.
          </p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="destructive"
      disabled={pending}
      className="w-full"
    >
      {pending ? "Unsubscribing..." : "Unsubscribe"}
    </Button>
  );
}
