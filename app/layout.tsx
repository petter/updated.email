import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ConvexClientProvider } from "./convex-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "updated.email",
  description:
    "Subscribe to your favorite npm packages and receive weekly updates on their latest releases.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider client={posthog}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
