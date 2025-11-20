"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
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
  sessionId: string | null;
}

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

  const packages = useQuery(api.subscriptions.getPackageSubscriptions, {
    email,
    sessionId: effectiveSessionId ?? undefined,
  });
  const addPackage = useMutation(api.subscriptions.addPackageSubscription);
  const removePackage = useMutation(
    api.subscriptions.removePackageSubscription,
  );
  const [error, setError] = useState<string | null>(null);

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
      }
    } catch (err) {
      setError("Failed to add package. Please try again.");
      console.error("Error adding package:", err);
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
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
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

        {/* Package Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
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

      {/* Packages List */}
      {packages.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              No packages subscribed yet. Use the search above to add packages.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.packageName}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{pkg.packageName}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="font-medium">Subscribed:</span>{" "}
                    {formatDate(pkg.subscribedAt)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemovePackage(pkg.packageName)}
                    className="w-full"
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
