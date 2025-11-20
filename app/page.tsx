import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewsletterForm } from "./newsletter-form";

const highlights = [
  {
    title: "Follow your favorites",
    description: "Choose the npm packages you actually use and care about.",
  },
  {
    title: "Weekly updates",
    description: "Receive a summary of what's been published in the last week.",
  },
  {
    title: "Stay up-to-date",
    description:
      "Keep up with the latest trends and changes in the frontend ecosystem.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-neutral-50 via-white to-neutral-100 px-6 py-16 dark:from-neutral-950 dark:via-black dark:to-neutral-950">
      {/* Top navigation */}
      <div className="mx-auto mb-12 flex w-full max-w-3xl items-center justify-end">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            Dashboard
          </Button>
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12">
        <header className="space-y-4 text-center">
          <Badge variant="outline" className="uppercase tracking-wide">
            updated.email
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-neutral-900 dark:text-white sm:text-5xl">
              Become a better frontend developer
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Subscribe to your favorite npm packages and receive weekly updates
              on their latest releases. Stay current with the changing frontend
              landscape without the noise.
            </p>
          </div>
        </header>

        <NewsletterForm />

        <ul className="grid gap-4 sm:grid-cols-3">
          {highlights.map((highlight) => (
            <li key={highlight.title} className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-sm">{highlight.title}</CardTitle>
                  <CardDescription>{highlight.description}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
