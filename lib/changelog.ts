import { ChangelogEntry } from "./types";
import { PackageVersion } from "./npm";

function parseRepositoryUrl(url: string): { owner: string; repo: string } | null {
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
    if (cleanUrl.startsWith("git://")) cleanUrl = cleanUrl.replace("git://", "https://");
    
    // Remove .git suffix
    if (cleanUrl.endsWith(".git")) cleanUrl = cleanUrl.substring(0, cleanUrl.length - 4);

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

function extractTagVersion(title: string): string | null {
  // Common tag formats: v1.0.0, 1.0.0, ver1.0.0, release-1.0.0
  // We want to extract the semantic version part 1.0.0
  const match = title.match(/v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?)/);
  return match ? match[1] : null;
}

export async function getChangelogs(
  repositoryUrl: string,
  versions: PackageVersion[]
): Promise<Record<string, ChangelogEntry>> {
  const repoInfo = parseRepositoryUrl(repositoryUrl);
  if (!repoInfo) {
    console.warn(`Could not parse repository URL: ${repositoryUrl}`);
    return {};
  }

  const { owner, repo } = repoInfo;
  const feedUrl = `https://github.com/${owner}/${repo}/releases.atom`;

  try {
    const response = await fetch(feedUrl, {
        next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch releases feed for ${owner}/${repo}: ${response.statusText}`);
      return {};
    }

    const xmlText = await response.text();
    const entries: Record<string, ChangelogEntry> = {};

    // Simple regex-based XML parsing for <entry>
    // Note: This is fragile but avoids heavy XML parser dependencies
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xmlText)) !== null) {
      const entryContent = match[1];
      
      const titleMatch = entryContent.match(/<title>(.*?)<\/title>/);
      if (!titleMatch) continue;
      
      const title = titleMatch[1];
      const version = extractTagVersion(title);
      
      if (!version) continue;

      // Check if this version is in our requested list
      // We check if the extracted version matches any of the requested versions
      const matchingVersion = versions.find(v => v.version === version);
      
      if (matchingVersion) {
        const contentMatch = entryContent.match(/<content type="html">([\s\S]*?)<\/content>/);
        const linkMatch = entryContent.match(/<link.*?href="(.*?)".*?\/>/);
        const updatedMatch = entryContent.match(/<updated>(.*?)<\/updated>/);
        
        if (contentMatch) {
            // Decode HTML entities in the content if necessary?
            // The content in Atom is usually XML-escaped HTML.
            // <content type="html">&lt;p&gt;...
            // We need to unescape it once to get the HTML string.
            let content = contentMatch[1];
            
            // Basic unescape
            content = content
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");

            entries[version] = {
                version,
                content,
                url: linkMatch ? linkMatch[1] : undefined,
                publishedAt: updatedMatch ? updatedMatch[1] : undefined
            };
        }
      }
    }

    return entries;

  } catch (error) {
    console.error(`Error fetching changelogs for ${owner}/${repo}:`, error);
    return {};
  }
}

