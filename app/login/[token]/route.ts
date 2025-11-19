import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexHttpClient(convexUrl);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const origin = new URL(request.url).origin;

  try {
    const result = await convex.mutation(api.auth.verifyLoginToken, { token });

    if (result.success && result.sessionId) {
      // Create response with redirect
      const response = NextResponse.redirect(new URL("/dashboard", origin));

      // Set session cookie directly on the response
      response.cookies.set("updated.email.session", result.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return response;
    } else {
      // Redirect to dashboard with error message
      const url = new URL("/dashboard", origin);
      url.searchParams.set(
        "error",
        result.message || "Invalid or expired token",
      );
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("Login failed", error);
    const url = new URL("/dashboard", origin);
    url.searchParams.set("error", "Something went wrong. Please try again.");
    return NextResponse.redirect(url);
  }
}
