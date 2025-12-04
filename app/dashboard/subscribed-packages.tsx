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
  const removePackage = useMutation(
    api.subscriptions.removePackageSubscription,
  );
  const [error, setError] = useState<string | null>(null);

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
