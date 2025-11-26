"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

interface PostHogIdentifyProps {
  email: string;
}

export function PostHogIdentify({ email }: PostHogIdentifyProps) {
  const posthog = usePostHog();

  useEffect(() => {
    if (email && posthog) {
      posthog.identify(email, {
        email,
      });
    }
  }, [email, posthog]);

  return null;
}
