"use client";

import { useActionState } from "react";
import { fetchPackageUpdatesAction } from "./action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export default function PackageUpdatesPage() {
  const [state, action, isPending] = useActionState(fetchPackageUpdatesAction, {
    status: "idle",
  });

  return (
    <div className="container mx-auto py-10 max-w-3xl px-4">
      <h1 className="text-2xl font-bold mb-6">Check Package Updates</h1>

      <form action={action} className="space-y-6 mb-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="packages">Packages (comma separated)</Label>
            <Input
              id="packages"
              name="packages"
              placeholder="react, next, @sentry/nextjs"
              defaultValue="react, next"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeRange">Time Range</Label>
            <Input
              id="timeRange"
              name="timeRange"
              placeholder="7d or 24h"
              defaultValue="7d"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Version Types</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeMajor"
                name="includeMajor"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="includeMajor" className="font-normal">
                Major
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeMinor"
                name="includeMinor"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="includeMinor" className="font-normal">
                Minor
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includePatch"
                name="includePatch"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="includePatch" className="font-normal">
                Patch
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includePreReleases"
            name="includePreReleases"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="includePreReleases" className="font-normal">
            Include pre-releases (alpha, beta, rc, etc.)
          </Label>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Fetching..." : "Check Updates"}
        </Button>
      </form>

      {state.status === "error" && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          {state.error}
        </div>
      )}

      {state.status === "success" && (
        <div className="space-y-6">
          {state.results.map((result) => (
            <Card key={result.packageName}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center text-lg">
                  <span>{result.packageName}</span>
                  <Badge variant="secondary">
                    {result.versions.length} updates
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.error ? (
                  <p className="text-red-500 text-sm">{result.error}</p>
                ) : result.versions.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No updates in this time range.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {result.versions.map((v) => (
                      <li
                        key={v.version}
                        className="border-b last:border-0 pb-2"
                      >
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="font-mono font-medium">
                            {v.version}
                          </span>
                          <span className="text-gray-500">
                            {v.publishedAt.toLocaleString()}
                          </span>
                        </div>
                        {result.changelogs?.[v.version] && (
                            <details className="group">
                                <summary className="text-xs text-blue-600 cursor-pointer hover:underline focus:outline-none w-fit">
                                    View Changelog
                                </summary>
                                <div 
                                    className="mt-2 text-sm bg-gray-50 p-3 rounded overflow-auto max-h-96 space-y-2"
                                >
                                    <div dangerouslySetInnerHTML={{ __html: result.changelogs[v.version].content }} />
                                    
                                    {result.changelogs[v.version].url && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <a 
                                                href={result.changelogs[v.version].url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-xs text-blue-500 hover:underline flex items-center"
                                            >
                                                View on GitHub &rarr;
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
