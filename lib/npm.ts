export type PackageVersion = {
  version: string;
  publishedAt: string; // ISO string
};

export type PackageUpdateResult = {
  packageName: string;
  versions: PackageVersion[];
  error?: string;
  repositoryUrl?: string;
};

/**
 * Options for filtering package updates.
 */
export type GetPackageUpdatesOptions = {
  /**
   * Whether to include pre-release versions (e.g. alpha, beta, canary, rc).
   * @default false
   */
  includePreReleases?: boolean;
  /**
   * Filter by version type (semver).
   * If a specific type is set to false, those versions will be excluded.
   * All default to true.
   */
  versions?: {
    /**
     * Include major updates (e.g. 1.0.0, 2.0.0).
     * @default true
     */
    major?: boolean;
    /**
     * Include minor updates (e.g. 1.1.0, 1.2.0).
     * @default true
     */
    minor?: boolean;
    /**
     * Include patch updates (e.g. 1.0.1, 1.0.2).
     * @default true
     */
    patch?: boolean;
  };
};

function isPreRelease(version: string): boolean {
  // Check for common pre-release indicators
  // Matches: -alpha, -beta, -rc, -canary, -next, -experimental, etc.
  // Semantic versioning usually separates pre-release with a hyphen
  return version.includes("-");
}

function getVersionType(
  version: string
): "major" | "minor" | "patch" | "unknown" {
  // Simple regex for semver
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return "unknown";

  const patch = parseInt(match[3], 10);
  const minor = parseInt(match[2], 10);

  if (patch > 0) return "patch";
  if (minor > 0) return "minor";
  return "major"; // e.g. 1.0.0, 2.0.0
}

/**
 * Fetches package versions published since a given date.
 *
 * @param packageName - The name of the package to fetch updates for.
 * @param since - The date to fetch updates since.
 * @param options - Filtering options for the updates.
 * @returns A promise that resolves to the package update result.
 */
export async function getPackageUpdates(
  packageName: string,
  since: Date,
  options: GetPackageUpdatesOptions = {}
): Promise<PackageUpdateResult> {
  const { includePreReleases = false, versions: versionOptions = {} } = options;

  const includeMajor = versionOptions.major ?? true;
  const includeMinor = versionOptions.minor ?? true;
  const includePatch = versionOptions.patch ?? true;

  try {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
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

    const data = await response.json();

    let repositoryUrl: string | undefined;
    if (data.repository) {
      if (typeof data.repository === "string") {
        repositoryUrl = data.repository;
      } else if (typeof data.repository === "object" && data.repository.url) {
        repositoryUrl = data.repository.url;
      }
    }

    const timeData = data.time as Record<string, string>;

    if (!timeData) {
      return { packageName, versions: [], repositoryUrl };
    }

    const versions: PackageVersion[] = [];

    for (const [version, time] of Object.entries(timeData)) {
      // Skip metadata keys
      if (version === "modified" || version === "created") continue;

      // Filter pre-releases if not requested
      if (!includePreReleases && isPreRelease(version)) {
        continue;
      }

      const type = getVersionType(version);

      if (type === "major" && !includeMajor) continue;
      if (type === "minor" && !includeMinor) continue;
      if (type === "patch" && !includePatch) continue;

      const publishedAt = new Date(time);
      if (publishedAt >= since) {
        versions.push({
          version,
          publishedAt: time,
        });
      }
    }

    // Sort by date descending
    versions.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return { packageName, versions, repositoryUrl };
  } catch (error) {
    return {
      packageName,
      versions: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
