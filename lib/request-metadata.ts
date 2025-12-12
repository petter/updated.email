import { createHash } from "node:crypto";
import { posthog } from "@/lib/posthog";

interface RequestMetadata {
  userAgent?: string;
  clientIp?: string;
  forwardedFor?: string;
  referer?: string;
  acceptLanguage?: string;
  secFetchSite?: string;
  secFetchMode?: string;
  secFetchDest?: string;
  secFetchUser?: string;
}

type TokenFlow = "verify" | "login" | "unsubscribe";
type TokenOutcome = "success" | "invalid" | "error";

interface TokenLogOptions {
  flow: TokenFlow;
  token: string;
  request: Request;
  outcome: TokenOutcome;
  email?: string;
  message?: string;
  extra?: Record<string, unknown>;
}

interface TokenLogPayload extends Record<string, unknown> {
  flow: TokenFlow;
  outcome: TokenOutcome;
  hashedToken: string;
  email?: string;
  message?: string;
  metadata: RequestMetadata;
  extra?: Record<string, unknown>;
}

const SEC_FETCH_HEADERS = [
  "sec-fetch-site",
  "sec-fetch-mode",
  "sec-fetch-dest",
  "sec-fetch-user",
] as const;

export function getRequestMetadata(request: Request): RequestMetadata {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for") ?? undefined;
  const forwardedChain = forwardedFor
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    userAgent: headers.get("user-agent") ?? undefined,
    clientIp: headers.get("x-real-ip") ?? forwardedChain?.[0],
    forwardedFor,
    referer: headers.get("referer") ?? undefined,
    acceptLanguage: headers.get("accept-language") ?? undefined,
    secFetchSite: headers.get(SEC_FETCH_HEADERS[0]) ?? undefined,
    secFetchMode: headers.get(SEC_FETCH_HEADERS[1]) ?? undefined,
    secFetchDest: headers.get(SEC_FETCH_HEADERS[2]) ?? undefined,
    secFetchUser: headers.get(SEC_FETCH_HEADERS[3]) ?? undefined,
  };
}

export function getTokenFingerprint(token: string): string {
  return createHash("sha256").update(token).digest("hex").slice(0, 16);
}

export function logTokenConsumption(options: TokenLogOptions): void {
  const metadata = getRequestMetadata(options.request);
  const hashedToken = getTokenFingerprint(options.token);
  const payload: TokenLogPayload = {
    flow: options.flow,
    outcome: options.outcome,
    hashedToken,
    email: options.email,
    message: options.message,
    metadata,
    extra: options.extra,
  };

  console.info("[token-consumption]", payload);

  posthog.capture({
    distinctId: options.email ?? hashedToken,
    event: "token_consumption",
    properties: payload,
  });
}
