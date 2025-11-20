import Image from "next/image";
import Link from "next/link";
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
    <main className="min-h-screen bg-background px-6 py-16">
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
          <div className="mb-6 flex items-center justify-center gap-3">
            <Image
              src="/logo.svg"
              alt="updated.email logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="uppercase tracking-wide text-muted-foreground font-medium text-lg">
              updated.email
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Stay up-to-date with the latest frontend news
            </h1>
            <p className="text-lg text-muted-foreground">
              Sign up to the newsletter that is tailored to your interests.
              Select the npm packages you actually use and care about, and
              receive weekly updates on their latest releases.
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
