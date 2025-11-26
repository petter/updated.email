import { PostHog } from "posthog-node";
import { env } from "@/env";

interface CaptureParams {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}

const posthogClient = env.NEXT_PUBLIC_POSTHOG_KEY
  ? new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      flushAt: 1, // Send events immediately
      flushInterval: 0,
    })
  : null;

export const posthog = {
  capture(params: CaptureParams) {
    posthogClient?.capture(params);
  },
};
