import { cookies } from "next/headers";
import { submitNewsletterAction } from "./newsletter-action";

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

type PageProps = {
  searchParams: Promise<{ newsletter?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const newsletterState = (await searchParams).newsletter;
  const showSuccess = newsletterState === "success";
  const showError = newsletterState === "error";

  // Check if user is already signed up via cookie
  const cookieStore = await cookies();
  const waitlistEmail = cookieStore.get("waitlist_email")?.value;
  const isAlreadySignedUp = !!waitlistEmail;

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

        <form
          action={submitNewsletterAction}
          className="space-y-6 rounded-3xl border border-neutral-200/80 bg-white/90 p-6 shadow-2xl shadow-neutral-900/5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60 md:p-10"
          aria-label="Join the updated.email waitlist"
        >
          {isAlreadySignedUp && (
            <div
              role="status"
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
              You&apos;re already signed up! We have{" "}
              <strong>{waitlistEmail}</strong> on our waitlist. We&apos;ll
              notify you when updated.email is ready.
            </div>
          )}

          {(showSuccess || showError) && !isAlreadySignedUp && (
            <div
              role="status"
              className={`rounded-2xl border px-4 py-3 text-sm ${
                showSuccess
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
              }`}
            >
              {showSuccess
                ? "Thanks! We've added you to the waitlist and sent you a confirmation email."
                : "We couldn't add you to the waitlist. Please try again."}
            </div>
          )}

          <div className="space-y-3 text-left">
            <label
              htmlFor="email"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
            >
              Email address
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                defaultValue={waitlistEmail || ""}
                disabled={isAlreadySignedUp}
                className="w-full flex-1 rounded-2xl border border-neutral-200/70 bg-white px-5 py-3 text-base text-neutral-900 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:ring-offset-neutral-900"
              />
              <button
                type="submit"
                disabled={isAlreadySignedUp}
                className="w-full rounded-2xl bg-neutral-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 sm:w-auto"
              >
                Join the waitlist
              </button>
            </div>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            We&apos;ll notify you when updated.email is ready. No spam,
            unsubscribe anytime.
          </p>
        </form>

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
