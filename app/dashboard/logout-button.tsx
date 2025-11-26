"use client";

import { usePostHog } from "posthog-js/react";
import { useTransition } from "react";
import { logoutAction } from "@/app/logout-action";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const posthog = usePostHog();

  const handleLogout = () => {
    startTransition(async () => {
      posthog.reset();
      await logoutAction();
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isPending}
      className="text-sm"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
