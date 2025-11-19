import { v } from "convex/values";
import { z } from "zod";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

// Environment variables - set these in Convex dashboard
// APP_URL should be your production URL (e.g., https://yourdomain.com)
// CRON_SECRET should match the CRON_SECRET in your Vercel environment variables
const APP_URL =
  process.env.APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Types
interface PackageVersion {
  version: string;
  publishedAt: Date;
}

interface PackageUpdateResult {
  packageName: string;
  versions: PackageVersion[];
  error?: string;
  repositoryUrl?: string;
}

interface ChangelogEntry {
  version: string;
  content: string; // HTML content
  url?: string;
  publishedAt?: string;
}

// Zod schemas
const NpmRegistryResponseSchema = z.object({
  repository: z
    .union([
      z.string(),
      z.object({
        url: z.string(),
      }),
    ])
    .optional(),
  time: z.record(z.string(), z.string()).optional(),
});

const GitHubReleaseSchema = z.object({
  tag_name: z.string(),
  body: z.string().nullable().optional(),
  body_html: z.string().optional(),
  html_url: z.string(),
  published_at: z.string().nullable().optional(),
});

const GitHubReleasesResponseSchema = z.array(GitHubReleaseSchema);

// Helper functions
function isPreRelease(version: string): boolean {
  return version.includes("-");
}

function getVersionType(
  version: string,
): "major" | "minor" | "patch" | "unknown" {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return "unknown";

  const patch = parseInt(match[3], 10);
  const minor = parseInt(match[2], 10);

  if (patch > 0) return "patch";
  if (minor > 0) return "minor";
  return "major";
}

function parseRepositoryUrl(
  url: string,
): { owner: string; repo: string } | null {
  try {
    let cleanUrl = url;

    if (url.startsWith("github:")) {
      const parts = url.substring(7).split("/");
      if (parts.length === 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    }

    if (cleanUrl.startsWith("git+")) cleanUrl = cleanUrl.substring(4);
    if (cleanUrl.startsWith("git://"))
      cleanUrl = cleanUrl.replace("git://", "https://");

    if (cleanUrl.endsWith(".git"))
      cleanUrl = cleanUrl.substring(0, cleanUrl.length - 4);

    const urlObj = new URL(cleanUrl);
    if (urlObj.hostname !== "github.com") return null;

    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    if (pathParts.length < 2) return null;

    return { owner: pathParts[0], repo: pathParts[1] };
  } catch (_e) {
    return null;
  }
}

function extractTagVersion(tag: string): string | null {
  const match = tag.match(/v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?)/);
  return match ? match[1] : null;
}

async function getPackageUpdates(
  packageName: string,
  since: Date,
): Promise<PackageUpdateResult> {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { packageName, versions: [], error: "Package not found" };
      }
      return {
        packageName,
        versions: [],
        error: `Failed to fetch: ${response.statusText}`,
      };
    }

    const rawData = await response.json();
    const parseResult = NpmRegistryResponseSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {
        packageName,
        versions: [],
        error: "Invalid response from NPM registry",
      };
    }

    const data = parseResult.data;

    let repositoryUrl: string | undefined;
    if (data.repository) {
      if (typeof data.repository === "string") {
        repositoryUrl = data.repository;
      } else if (typeof data.repository === "object" && data.repository.url) {
        repositoryUrl = data.repository.url;
      }
    }

    const timeData = data.time;

    if (!timeData) {
      return { packageName, versions: [], repositoryUrl };
    }

    const versions: PackageVersion[] = [];

    for (const [version, time] of Object.entries(timeData)) {
      if (version === "modified" || version === "created") continue;

      if (isPreRelease(version)) continue;

      const type = getVersionType(version);
      if (type === "unknown") continue;

      const publishedAt = new Date(time);
      if (publishedAt >= since) {
        versions.push({
          version,
          publishedAt,
        });
      }
    }

    versions.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    return { packageName, versions, repositoryUrl };
  } catch (error) {
    return {
      packageName,
      versions: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function getChangelogs(
  repositoryUrl: string,
  versions: PackageVersion[],
): Promise<Record<string, ChangelogEntry>> {
  const repoInfo = parseRepositoryUrl(repositoryUrl);
  if (!repoInfo) {
    return {};
  }

  const { owner, repo } = repoInfo;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`;

  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.html+json",
    };

    if (GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      return {};
    }

    const rawData = await response.json();
    const parseResult = GitHubReleasesResponseSchema.safeParse(rawData);

    if (!parseResult.success) {
      return {};
    }

    const releases = parseResult.data;
    const entries: Record<string, ChangelogEntry> = {};

    for (const release of releases) {
      const version = extractTagVersion(release.tag_name);
      if (!version) continue;

      const matchingVersion = versions.find((v) => v.version === version);

      if (matchingVersion) {
        const content = release.body_html || release.body || "";

        entries[version] = {
          version,
          content,
          url: release.html_url,
          publishedAt: release.published_at || undefined,
        };
      }
    }

    return entries;
  } catch (_error) {
    return {};
  }
}

/**
 * Sends a newsletter email to a single subscriber with their package updates.
 */
export const sendNewsletterToSubscriber = action({
  args: {
    email: v.string(),
    packageNames: v.array(v.string()),
    since: v.number(), // timestamp
  },
  handler: async (
    ctx,
    args,
  ): Promise<
    { success: true; emailId?: string } | { success: false; error: string }
  > => {
    // Fetch package updates for all subscribed packages
    const packageUpdates: Array<
      PackageUpdateResult & { changelogs: Record<string, ChangelogEntry> }
    > = [];

    for (const packageName of args.packageNames) {
      const updates = await getPackageUpdates(
        packageName,
        new Date(args.since),
      );

      // Fetch changelogs if we have versions
      let changelogs: Record<string, ChangelogEntry> = {};
      if (updates.versions.length > 0 && updates.repositoryUrl) {
        changelogs = await getChangelogs(
          updates.repositoryUrl,
          updates.versions,
        );
      }

      packageUpdates.push({
        ...updates,
        changelogs,
      });
    }

    // Generate unsubscribe link
    const unsubscribeTokenResult = await ctx.runMutation(
      api.subscriptions.generateUnsubscribeToken,
      { email: args.email },
    );

    const unsubscribeLink: string | undefined = unsubscribeTokenResult.success
      ? `${APP_URL}/unsubscribe/${unsubscribeTokenResult.token}`
      : undefined;

    // Call Next.js API route to render and send email
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add authorization header with CRON_SECRET (same as Vercel cron jobs use)
    if (CRON_SECRET) {
      headers.Authorization = `Bearer ${CRON_SECRET}`;
    }

    const response: Response = await fetch(`${APP_URL}/api/send-newsletter`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: args.email,
        packageUpdates,
        unsubscribeLink,
      }),
    });

    // Calculate total update count
    const updateCount = packageUpdates.reduce(
      (sum, pkg) => sum + pkg.versions.length,
      0,
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || "Failed to send email";
      console.error(
        `Failed to send newsletter to ${args.email}:`,
        errorMessage,
      );

      // Record failed send
      await ctx.runMutation(api.newsletters.recordNewsletterSend, {
        email: args.email,
        packageNames: args.packageNames,
        packageCount: args.packageNames.length,
        updateCount,
        status: "error",
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }

    const result = await response.json();

    // Record successful send
    await ctx.runMutation(api.newsletters.recordNewsletterSend, {
      email: args.email,
      packageNames: args.packageNames,
      packageCount: args.packageNames.length,
      updateCount,
      status: "success",
      emailId: result.emailId,
    });

    return { success: true, emailId: result.emailId };
  },
});

/**
 * Sends newsletters to all active subscribers.
 * This is called by the cron job.
 */
export const sendNewslettersToAllSubscribers = action({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    success: boolean;
    sent: number;
    errors: number;
    total: number;
  }> => {
    // Get all active subscriptions
    const subscriptions = await ctx.runQuery(
      api.subscriptions.getAllActiveSubscriptions,
    );

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    let successCount = 0;
    let errorCount = 0;

    for (const subscription of subscriptions) {
      // Get package subscriptions for this user
      const packageSubscriptions = await ctx.runQuery(
        api.subscriptions.getPackageSubscriptions,
        { email: subscription.email },
      );

      if (packageSubscriptions.length === 0) {
        // Skip users with no package subscriptions
        continue;
      }

      // Determine the "since" date - use last newsletter sent date or subscription date
      const since =
        subscription.lastNewsletterSentAt ??
        subscription.subscribedAt ??
        oneWeekAgo;

      const packageNames = packageSubscriptions.map(
        (pkg: { packageName: string }) => pkg.packageName,
      );

      try {
        const result = await ctx.runAction(
          api.newsletters.sendNewsletterToSubscriber,
          {
            email: subscription.email,
            packageNames,
            since,
          },
        );

        if (result.success) {
          // Update last newsletter sent date
          await ctx.runMutation(api.subscriptions.updateLastNewsletterSentAt, {
            email: subscription.email,
            timestamp: now,
          });
          successCount++;
        } else {
          errorCount++;
          console.error(
            `Failed to send newsletter to ${subscription.email}:`,
            result.error,
          );
        }
      } catch (error) {
        errorCount++;
        console.error(
          `Error sending newsletter to ${subscription.email}:`,
          error,
        );
      }
    }

    return {
      success: true,
      sent: successCount,
      errors: errorCount,
      total: subscriptions.length,
    };
  },
});

/**
 * Records a newsletter send in the database.
 */
export const recordNewsletterSend = mutation({
  args: {
    email: v.string(),
    packageNames: v.array(v.string()),
    packageCount: v.number(),
    updateCount: v.number(),
    status: v.union(v.literal("success"), v.literal("error")),
    emailId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("newsletter_sends", {
      email: args.email,
      sentAt: Date.now(),
      packageNames: args.packageNames,
      packageCount: args.packageCount,
      updateCount: args.updateCount,
      status: args.status,
      emailId: args.emailId,
      error: args.error,
    });
  },
});

/**
 * Gets all newsletter sends for a specific email address.
 */
export const getNewsletterSendsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const sends = await ctx.db
      .query("newsletter_sends")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    // Sort by sentAt descending (most recent first)
    return sends.sort((a, b) => b.sentAt - a.sentAt);
  },
});

/**
 * Gets all newsletter sends, optionally filtered by date range.
 */
export const getAllNewsletterSends = query({
  args: {
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let sends = await ctx.db
      .query("newsletter_sends")
      .withIndex("by_sentAt")
      .collect();

    // Filter by date range if provided
    const { startDate, endDate } = args;
    if (startDate) {
      sends = sends.filter((send) => send.sentAt >= startDate);
    }
    if (endDate) {
      sends = sends.filter((send) => send.sentAt <= endDate);
    }

    // Sort by sentAt descending (most recent first)
    sends.sort((a, b) => b.sentAt - a.sentAt);

    // Apply limit if provided
    if (args.limit) {
      sends = sends.slice(0, args.limit);
    }

    return sends;
  },
});
