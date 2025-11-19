"use client";

import { PackageSelect } from "@/components/package-select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function TestPackageSelectPage() {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

  const handleSelect = (packageName: string) => {
    setSelectedPackages((prev) => {
      // Avoid duplicates
      if (prev.includes(packageName)) {
        return prev;
      }
      return [...prev, packageName];
    });
  };

  const handleRemove = (packageName: string) => {
    setSelectedPackages((prev) => prev.filter((pkg) => pkg !== packageName));
  };

  return (
    <main className="flex min-h-screen items-center bg-linear-to-b from-neutral-50 via-white to-neutral-100 px-6 py-16 dark:from-neutral-950 dark:via-black dark:to-neutral-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-4 text-center">
          <Badge variant="outline" className="uppercase tracking-wide">
            Package Select Test
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold leading-tight text-neutral-900 dark:text-white sm:text-4xl">
              npm Package Selector
            </h1>
            <p className="text-base text-neutral-600 dark:text-neutral-300">
              Search and select npm packages to add to your list
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Search Packages</CardTitle>
            <CardDescription>
              Type to search for npm packages. Results are sorted by download
              count.
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <PackageSelect onSelect={handleSelect} />
          </div>
        </Card>

        {selectedPackages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Selected Packages ({selectedPackages.length})
              </CardTitle>
              <CardDescription>
                Packages you&apos;ve selected will appear here
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="flex flex-wrap gap-2">
                {selectedPackages.map((pkg) => (
                  <Badge
                    key={pkg}
                    variant="secondary"
                    className="group relative pr-6"
                  >
                    {pkg}
                    <button
                      onClick={() => handleRemove(pkg)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-label={`Remove ${pkg}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
