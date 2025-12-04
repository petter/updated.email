"use client";

import { useMutation, useQuery } from "convex/react";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { PackageSelect } from "@/components/package-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { getSessionIdFromCookie } from "@/lib/client-auth";

interface SubscribedPackagesProps {
  email: string;
  sessionId: string;
}

const favouritePackages = [
  "react",
  "next",
  "svelte",
  "astro",
  "tailwindcss",
  "biome",
  "@biomejs/biome",
  "prettier",
  "oxfmt",
  "oxlint",
  "eslint",
  "typescript",
  "@tanstack/react-query",
  "@tanstack/react-table",
  "@tanstack/react-router",
  "@tanstack/react-db",
  "@tanstack/ai",
  "ai",
  "vite",
  "vitest",
  "pnpm",
  "bun",
];

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SubscribedPackages({
  email,
  sessionId,
}: SubscribedPackagesProps) {
  // Fallback to reading from cookie if sessionId prop is not provided
  const effectiveSessionId = sessionId ?? getSessionIdFromCookie();
  const posthog = usePostHog();

  const packages = useQuery(api.subscriptions.getPackageSubscriptions, {
    email,
    sessionId: effectiveSessionId ?? undefined,
  });
  const addPackage = useMutation(api.subscriptions.addPackageSubscription);
  const addPackagesBulk = useMutation(
    api.subscriptions.addPackageSubscriptionsBulk,
  );
  const removePackage = useMutation(
    api.subscriptions.removePackageSubscription,
  );
  const [error, setError] = useState<string | null>(null);
  const [isAddingFavorites, setIsAddingFavorites] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false);

  const maxVisibleFavorites = 5;
  const hasHiddenFavorites = favouritePackages.length > maxVisibleFavorites;
  const visibleFavorites = showAllFavorites
    ? favouritePackages
    : favouritePackages.slice(0, maxVisibleFavorites);
  const hiddenFavoritesCount = hasHiddenFavorites
    ? favouritePackages.length - maxVisibleFavorites
    : 0;

  // Update PostHog user properties when packages change
  useEffect(() => {
    if (packages && posthog) {
      const packageNames = packages.map((pkg) => pkg.packageName);
      posthog.identify(email, {
        subscribed_packages: packageNames,
        subscribed_packages_count: packageNames.length,
      });
    }
  }, [packages, posthog, email]);

  const handleAddPackage = async (packageName: string) => {
    setError(null);
    try {
      const result = await addPackage({
        email,
        packageName,
        sessionId: effectiveSessionId ?? undefined,
      });
      if (!result.success) {
        setError(result.message || "Failed to add package");
      } else {
        posthog.capture("package_subscribed", {
          package_name: packageName,
        });
      }
    } catch (err) {
      setError("Failed to add package. Please try again.");
      console.error("Error adding package:", err);
    }
  };

  const handleAddFavorites = async () => {
    setError(null);
    setIsAddingFavorites(true);

    const subscribedSet = new Set(packages?.map((pkg) => pkg.packageName));
    const toAdd = favouritePackages.filter(
      (packageName) => !subscribedSet.has(packageName),
    );

    if (toAdd.length === 0) {
      setIsAddingFavorites(false);
      return;
    }

    try {
      const result = await addPackagesBulk({
        email,
        packageNames: toAdd,
        sessionId: effectiveSessionId ?? undefined,
      });

      if (!result.success) {
        setError("Failed to add favorites.");
        return;
      }

      if (result.added && result.added.length > 0) {
        posthog.capture("packages_subscribed_bulk", {
          package_names: result.added,
          count: result.added.length,
        });
      }
    } catch (err) {
      setError("Failed to add favorites. Please try again.");
      console.error("Error adding favorites:", err);
    } finally {
      setIsAddingFavorites(false);
    }
  };

  const handleRemovePackage = async (packageName: string) => {
    setError(null);
    try {
      const result = await removePackage({
        email,
        packageName,
        sessionId: effectiveSessionId ?? undefined,
      });
      if (!result.success) {
        setError(result.message || "Failed to remove package");
      } else {
        posthog.capture("package_unsubscribed", {
          package_name: packageName,
        });
      }
    } catch (err) {
      setError("Failed to remove package. Please try again.");
      console.error("Error removing package:", err);
    }
  };

  // Show loading state
  if (packages === undefined) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">
            Subscribed Packages
          </h2>
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Add Package Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Package List Skeleton */}
        <Card className="py-0">
          <CardContent className="px-6 py-0">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col />
                  <col className="w-[220px]" />
                  <col className="w-[96px]" />
                </colgroup>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Package</th>
                    <th scope="col">Subscription Date</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr
                      key={i}
                      className="border-b last:border-b-0 align-middle"
                    >
                      <td className="py-3">
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="py-3 text-center">
                        <Skeleton className="h-4 w-40 mx-auto" />
                      </td>
                      <td className="py-3 text-right">
                        <Skeleton className="h-9 w-20 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const hasSubscribedAllFavorites = favouritePackages.every((packageName) =>
    packages.some((pkg) => pkg.packageName === packageName),
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">
          Subscribed Packages
        </h2>
        <Badge variant="outline">{packages.length} packages</Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add Package Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Package</CardTitle>
          <CardDescription>
            Search for npm packages to subscribe to updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PackageSelect onSelect={handleAddPackage} className="w-full" />
        </CardContent>
      </Card>

      {!hasSubscribedAllFavorites && (
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Petter&apos;s favorites</CardTitle>
            <CardDescription>
              These are the packages that I find most interesting to follow the
              development of.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {visibleFavorites.map((packageName) => {
                  const isSubscribed = packages.some(
                    (pkg) => pkg.packageName === packageName,
                  );

                  return (
                    <Badge
                      key={packageName}
                      variant={isSubscribed ? "secondary" : "outline"}
                      className="text-sm"
                    >
                      {packageName}
                    </Badge>
                  );
                })}
                {!showAllFavorites && hiddenFavoritesCount > 0 && (
                  <Badge variant="outline" className="text-sm">
                    +{hiddenFavoritesCount} more
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                {hasHiddenFavorites && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllFavorites((prev) => !prev)}
                    className="w-full sm:w-auto"
                  >
                    {showAllFavorites ? "Show less" : "Show all"}
                  </Button>
                )}
                <Button
                  onClick={handleAddFavorites}
                  disabled={
                    isAddingFavorites ||
                    favouritePackages.every((packageName) =>
                      packages.some((pkg) => pkg.packageName === packageName),
                    )
                  }
                  className="w-full sm:w-auto"
                >
                  {isAddingFavorites
                    ? "Adding..."
                    : `Add all (${
                        favouritePackages.filter(
                          (packageName) =>
                            !packages.some(
                              (pkg) => pkg.packageName === packageName,
                            ),
                        ).length
                      })`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Packages List */}
      {packages.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No packages subscribed yet. Use the search above to add packages.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <CardContent className="px-6 py-0">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col />
                  <col className="w-[220px]" />
                  <col className="w-[96px]" />
                </colgroup>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Package</th>
                    <th scope="col">Subscription Date</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr
                      key={pkg.packageName}
                      className="border-b last:border-b-0 align-middle"
                    >
                      <td className="py-3 font-semibold">{pkg.packageName}</td>
                      <td className="py-3 text-center text-sm text-muted-foreground">
                        Subscribed: {formatDate(pkg.subscribedAt)}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePackage(pkg.packageName)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
