"use client";

import { debounce } from "es-toolkit/function";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NpmPackage {
  name: string;
  version: string;
  description?: string;
  downloads: {
    lastMonth: number;
  };
}

interface NpmSearchResponse {
  objects: Array<{
    package: {
      name: string;
      version: string;
      description?: string;
    };
    downloads?: {
      monthly?: number;
      weekly?: number;
    };
  }>;
}

interface PackageSelectProps {
  onSelect: (packageName: string) => void;
  className?: string;
}

export function PackageSelect({ onSelect, className }: PackageSelectProps) {
  const [query, setQuery] = useState("");
  const [packages, setPackages] = useState<NpmPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchPackages = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setPackages([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(
          searchQuery,
        )}&size=20`,
      );
      const data = (await response.json()) as NpmSearchResponse;

      // Sort by download count (descending) and map to our interface
      const sortedPackages: NpmPackage[] = data.objects
        .map((obj) => ({
          name: obj.package.name,
          version: obj.package.version,
          description: obj.package.description,
          downloads: {
            lastMonth: obj.downloads?.monthly || 0,
          },
        }))
        .sort(
          (a: NpmPackage, b: NpmPackage) =>
            b.downloads.lastMonth - a.downloads.lastMonth,
        );

      setPackages(sortedPackages);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error searching packages:", error);
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create debounced search function
  const debouncedSearch = useMemo(
    () => debounce(searchPackages, 300),
    [searchPackages],
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSelect = (packageName: string) => {
    onSelect(packageName);
    setQuery("");
    setPackages([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search npm packages (e.g. react)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          debouncedSearch(e.target.value);
        }}
        onFocus={() => {
          if (packages.length > 0) {
            setIsOpen(true);
          }
        }}
        onKeyDown={(e) => {
          if (!isOpen || packages.length === 0) return;

          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              setSelectedIndex((prev) =>
                prev < packages.length - 1 ? prev + 1 : prev,
              );
              break;
            case "ArrowUp":
              e.preventDefault();
              setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
              break;
            case "Enter":
              e.preventDefault();
              if (selectedIndex >= 0 && selectedIndex < packages.length) {
                handleSelect(packages[selectedIndex].name);
              }
              break;
            case "Escape":
              setIsOpen(false);
              setSelectedIndex(-1);
              break;
          }
        }}
        className="w-full"
      />
      {isOpen && (packages.length > 0 || isLoading) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-lg"
        >
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Searching...
            </div>
          ) : (
            packages.map((pkg, index) => (
              <button
                key={pkg.name}
                type="button"
                onClick={() => handleSelect(pkg.name)}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-colors",
                  "hover:bg-accent",
                  index === selectedIndex && "bg-accent",
                  index === 0 && "rounded-t-md",
                  index === packages.length - 1 && "rounded-b-md",
                )}
              >
                <div className="font-medium text-popover-foreground">
                  {pkg.name}
                </div>
                {pkg.description && (
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {pkg.description}
                  </div>
                )}
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {pkg.downloads.lastMonth.toLocaleString()} downloads/month
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
