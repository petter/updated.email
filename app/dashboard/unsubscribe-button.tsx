"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UnsubscribeButtonProps {
  token: string | null;
}

export function UnsubscribeButton({ token }: UnsubscribeButtonProps) {
  if (!token) {
    return (
      <Button variant="destructive" disabled>
        Unsubscribe from newsletters
      </Button>
    );
  }

  return (
    <Button variant="destructive" asChild>
      <Link href={`/unsubscribe/${token}`}>Unsubscribe from newsletters</Link>
    </Button>
  );
}
