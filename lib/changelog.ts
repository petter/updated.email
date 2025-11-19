import { z } from "zod";
import { env } from "@/env";
import type { PackageVersion } from "./npm";
import type { ChangelogEntry } from "./types";

const GitHubReleaseSchema = z.object({
  tag_name: z.string(),
  body: z.string().nullable().optional(),
  body_html: z.string().optional(),
  html_url: z.string(),
  published_at: z.string().nullable().optional(),
});

const GitHubReleasesResponseSchema = z.array(GitHubReleaseSchema);

function parseRepositoryUrl(
  url: string,
): { owner: string; repo: string } | null {
  try {
    let cleanUrl = url;

    // Handle github shorthand
    if (url.startsWith("github:")) {
      const parts = url.substring(7).split("/");
      if (parts.length === 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    }

    // Remove git+ or git:// prefixes
    if (cleanUrl.startsWith("git+")) cleanUrl = cleanUrl.substring(4);
    if (cleanUrl.startsWith("git://"))
      cleanUrl = cleanUrl.replace("git://", "https://");

    // Remove .git suffix
    if (cleanUrl.endsWith(".git"))
      cleanUrl = cleanUrl.substring(0, cleanUrl.length - 4);

    // Parse URL
    const urlObj = new URL(cleanUrl);
    if (urlObj.hostname !== "github.com") return null;

    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    if (pathParts.length < 2) return null;

    return { owner: pathParts[0], repo: pathParts[1] };
  } catch (e) {
    console.error("Failed to parse repository URL:", url, e);
    return null;
  }
}

function extractTagVersion(tag: string): string | null {
  // Common tag formats: v1.0.0, 1.0.0, ver1.0.0, release-1.0.0
  // We want to extract the semantic version part 1.0.0
  const match = tag.match(/v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?)/);
  return match ? match[1] : null;
}

export async function getChangelogs(
  repositoryUrl: string,
  versions: PackageVersion[],
): Promise<Record<string, ChangelogEntry>> {
  const repoInfo = parseRepositoryUrl(repositoryUrl);
  if (!repoInfo) {
    console.warn(`Could not parse repository URL: ${repositoryUrl}`);
    return {};
  }

  const { owner, repo } = repoInfo;
  // Use GitHub API instead of Atom feed
  // Fetch up to 100 releases to get better history coverage
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`;

  try {
    const headers: HeadersInit = {
      // Request HTML content for the body
      Accept: "application/vnd.github.html+json",
    };

    if (env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
    }

    const response = await fetch(apiUrl, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.warn(
        `Failed to fetch releases from GitHub API for ${owner}/${repo}: ${response.statusText}`,
      );
      return {};
    }

    const rawData = await response.json();
    const parseResult = GitHubReleasesResponseSchema.safeParse(rawData);

    if (!parseResult.success) {
      console.error(
        `Failed to parse GitHub releases for ${owner}/${repo}:`,
        parseResult.error,
      );
      return {};
    }

    const releases = parseResult.data;
    const entries: Record<string, ChangelogEntry> = {};

    for (const release of releases) {
      const version = extractTagVersion(release.tag_name);
      if (!version) continue;

      // Check if this version is in our requested list
      const matchingVersion = versions.find((v) => v.version === version);

      if (matchingVersion) {
        // Use body_html if available (from custom header), fallback to body (markdown)
        // The Zod schema has body_html as optional because it depends on the Accept header
        // But since we sent the header, it should be there in the raw response and thus in the data if we typed it right?
        // Actually, GitHub returns body_html property when the media type is used.
        // Let's check if we got it.
        const content = release.body_html || release.body || "";

        entries[version] = {
          version,
          content, // This will be HTML due to the Accept header
          url: release.html_url,
          publishedAt: release.published_at || undefined,
        };
      }
    }

    return entries;
  } catch (error) {
    console.error(`Error fetching changelogs for ${owner}/${repo}:`, error);
    return {};
  }
}
