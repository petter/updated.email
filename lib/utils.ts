import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTimeRange(range: string): Date | null {
  const match = range.match(/^(\d+)([dh])$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const now = new Date();

  // Use UTC to avoid timezone issues when comparing with registry dates
  // But actually, Date objects compare fine regardless of timezone as they are just timestamps.
  // The issue might be related to how "now" is calculated relative to the registry "modified" time.

  if (unit === "d") {
    return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
  } else if (unit === "h") {
    return new Date(now.getTime() - value * 60 * 60 * 1000);
  }
  return null;
}
