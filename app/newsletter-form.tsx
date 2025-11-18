"use client";

import { useActionState } from "react";
import { submitNewsletterAction } from "./newsletter-action";

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(
    submitNewsletterAction,
    null
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl border border-neutral-200/80 bg-white/90 p-6 shadow-2xl shadow-neutral-900/5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60 md:p-10"
      aria-label="Join the updated.email waitlist"
    >
      {state?.success === true && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          {state.isNew ? (
            <>
              Thanks! We&apos;ve added you to the waitlist and sent you a
              confirmation email.
            </>
          ) : (
            <>
              We appreciate your eagerness! You&apos;re already signed up with{" "}
              <strong>{state.email}</strong>. We&apos;ll notify you when
              updated.email is ready.
            </>
          )}
        </div>
      )}

      {state?.success === false && (
        <div
          role="status"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {state.error}
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
            disabled={isPending}
            className="w-full flex-1 rounded-2xl border border-neutral-200/70 bg-white px-5 py-3 text-base text-neutral-900 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:ring-offset-neutral-900"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-neutral-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 sm:w-auto"
          >
            {isPending ? "Joining..." : "Join the waitlist"}
          </button>
        </div>
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        We&apos;ll notify you when updated.email is ready. No spam, unsubscribe
        anytime.
      </p>
    </form>
  );
}
