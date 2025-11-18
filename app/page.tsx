import { NewsletterForm } from "./newsletter-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const highlights = [
  {
    title: "Fresh releases",
    description: "Weekly snapshots of every npm package you care about.",
  },
  {
    title: "Meaningful signals",
    description: "Changelogs, adoption trends, and compatibility hints.",
  },
  {
    title: "Actionable alerts",
    description: "Know when it's time to upgrade or investigate a regression.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen items-center bg-linear-to-b from-neutral-50 via-white to-neutral-100 px-6 py-16 dark:from-neutral-950 dark:via-black dark:to-neutral-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12">
        <header className="space-y-4 text-center">
          <Badge variant="outline" className="uppercase tracking-wide">
            updated.email
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-neutral-900 dark:text-white sm:text-5xl">
              Stay ahead of your dependencies
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Add the packages that matter, get a curated weekly brief on new
              releases, breaking changes, and adoption signals.
            </p>
            <p className="text-base text-neutral-500 dark:text-neutral-400">
              Purpose-built for developers who want an automated npm release
              radar.
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
