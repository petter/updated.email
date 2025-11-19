"use server";

import { getChangelogs } from "@/lib/changelog";
import { getPackageUpdates, type PackageUpdateResult } from "@/lib/npm";
import type { ChangelogEntry } from "@/lib/types";
import { parseTimeRange } from "@/lib/utils";

export type PackageUpdateWithChangelog = PackageUpdateResult & {
  changelogs?: Record<string, ChangelogEntry>;
};

export type PackageUpdatesState =
  | { status: "idle" }
  | { status: "success"; results: PackageUpdateWithChangelog[] }
  | { status: "error"; error: string };

export async function fetchPackageUpdatesAction(
  _prevState: PackageUpdatesState,
  formData: FormData,
): Promise<PackageUpdatesState> {
  const packagesInput = formData.get("packages");
  const timeRangeInput = formData.get("timeRange");

  // Checkboxes return "on" if checked, null if not
  const includePreReleases = formData.get("includePreReleases") === "on";
  const includeMajor = formData.get("includeMajor") === "on";
  const includeMinor = formData.get("includeMinor") === "on";
  const includePatch = formData.get("includePatch") === "on";

  if (typeof packagesInput !== "string" || !packagesInput.trim()) {
    return { status: "error", error: "Please provide a list of packages." };
  }

  if (typeof timeRangeInput !== "string" || !timeRangeInput.trim()) {
    return { status: "error", error: "Please provide a time range." };
  }

  const since = parseTimeRange(timeRangeInput.trim());
  if (!since) {
    return {
      status: "error",
      error: "Invalid time range. Use format like '7d' or '24h'.",
    };
  }

  const packages = packagesInput
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (packages.length === 0) {
    return { status: "error", error: "No valid packages provided." };
  }

  try {
    const results = await Promise.all(
      packages.map((pkg) =>
        getPackageUpdates(pkg, since, {
          includePreReleases,
          versions: {
            major: includeMajor,
            minor: includeMinor,
            patch: includePatch,
          },
        }),
      ),
    );

    // Fetch changelogs for each result
    const resultsWithChangelogs: PackageUpdateWithChangelog[] =
      await Promise.all(
        results.map(async (result) => {
          if (result.repositoryUrl && result.versions.length > 0) {
            const changelogs = await getChangelogs(
              result.repositoryUrl,
              result.versions,
            );
            return { ...result, changelogs };
          }
          return result;
        }),
      );

    return { status: "success", results: resultsWithChangelogs };
  } catch (error) {
    console.error("Failed to fetch package updates", error);
    return { status: "error", error: "An unexpected error occurred." };
  }
}
