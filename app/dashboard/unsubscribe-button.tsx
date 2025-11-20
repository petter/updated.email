"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UnsubscribeButtonProps {
  token: string | null;
}

export function UnsubscribeButton({ token }: UnsubscribeButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      !confirm(
        "Are you sure you want to unsubscribe from updated.email newsletters?",
      )
    ) {
      e.preventDefault();
    }
  };

  if (!token) {
    return (
      <Button variant="destructive" disabled>
        Unsubscribe from newsletters
      </Button>
    );
  }

  return (
    <Button variant="destructive" asChild>
      <Link href={`/unsubscribe/${token}`} onClick={handleClick}>
        Unsubscribe from newsletters
      </Link>
    </Button>
  );
}
