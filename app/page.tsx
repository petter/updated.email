import { NewsletterForm } from "./newsletter-form";

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
          <span className="inline-flex items-center justify-center rounded-full border border-neutral-200/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
            updated.email
          </span>
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
            <li
              key={highlight.title}
              className="rounded-2xl border border-neutral-200/80 p-4 text-left dark:border-neutral-800"
            >
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {highlight.title}
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {highlight.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
