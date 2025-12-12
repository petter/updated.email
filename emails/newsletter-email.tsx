import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { PackageUpdateResult } from "../lib/npm";
import type { ChangelogEntry } from "../lib/types";
import { EmailFooter } from "./components/email-footer";
import { EmailHeader } from "./components/email-header";

type NewsletterEmailProps = {
  packageUpdates: Array<
    PackageUpdateResult & { changelogs: Record<string, ChangelogEntry> }
  >;
  unsubscribeLink?: string;
  dashboardLink?: string;
};

export function NewsletterEmail({
  packageUpdates,
  unsubscribeLink,
  dashboardLink,
}: NewsletterEmailProps) {
  const hasUpdates = packageUpdates.some(
    (pkg) => pkg.versions.length > 0 && !pkg.error,
  );

  return (
    <Html>
      <Head />
      <Preview>Your Weekly Package Updates</Preview>
      <Tailwind>
        <Body className="bg-[#fef5f5] p-6 text-[#2d1a1a] font-sans">
          <Container className="max-w-[600px] mx-auto">
            <Section className="bg-[#fffefe] rounded-[18px] p-8">
              <EmailHeader heading="Your Weekly Package Updates" />
              {!hasUpdates ? (
                <Text className="text-[15px] leading-[1.6] m-0 mb-6 text-[#2d1a1a]">
                  No new updates this week for the packages you're subscribed
                  to. Check back next week!
                </Text>
              ) : (
                <>
                  <Text className="text-[15px] leading-[1.6] m-0 mb-6 text-[#2d1a1a]">
                    Here are the latest updates for the packages you're
                    following:
                  </Text>
                  {packageUpdates.map((pkg) => {
                    if (pkg.error || pkg.versions.length === 0) {
                      return null;
                    }

                    return (
                      <Section
                        key={pkg.packageName}
                        className="mb-8 pb-6 border-b border-[#f5d5d5]"
                      >
                        <Heading
                          as="h2"
                          className="text-xl font-semibold m-0 mb-4 text-[#2d1a1a]"
                        >
                          {pkg.packageName}
                        </Heading>
                        {pkg.versions.map((version) => {
                          const changelog = pkg.changelogs[version.version];
                          return (
                            <Section
                              key={version.version}
                              className="mb-5 pl-4 border-l-[3px] border-[#dc2626]"
                            >
                              <Row>
                                <Column className="w-auto align-middle pr-3">
                                  <Text className="text-sm font-semibold text-[#dc2626] bg-[#fee2e2] px-[10px] py-1 rounded-md m-0 inline-block">
                                    {version.version}
                                  </Text>
                                </Column>
                                <Column className="w-auto align-middle">
                                  <Text className="text-[13px] text-[#9d7a7a] m-0">
                                    {new Date(
                                      version.publishedAt,
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </Text>
                                </Column>
                              </Row>
                              {changelog ? (
                                <div
                                  className="text-sm leading-[1.6] text-[#2d1a1a] mb-2"
                                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Changelog content is HTML from GitHub releases API
                                  dangerouslySetInnerHTML={{
                                    __html: changelog.content,
                                  }}
                                />
                              ) : (
                                <Text className="text-sm text-[#9d7a7a] italic mb-2 m-0">
                                  No changelog available for this version.
                                </Text>
                              )}
                              {changelog?.url && (
                                <Text className="mt-2 m-0">
                                  <Link
                                    href={changelog.url}
                                    className="text-sm text-[#dc2626] no-underline font-medium"
                                  >
                                    View release →
                                  </Link>
                                </Text>
                              )}
                            </Section>
                          );
                        })}
                      </Section>
                    );
                  })}
                </>
              )}
              {dashboardLink && (
                <Section className="mt-8 mb-6 text-center">
                  <Button
                    href={dashboardLink}
                    className="bg-[#dc2626] text-white text-[15px] font-semibold px-6 py-3 rounded-lg no-underline leading-normal inline-block"
                  >
                    Go to dashboard
                  </Button>
                </Section>
              )}
              <EmailFooter unsubscribeLink={unsubscribeLink} />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

NewsletterEmail.PreviewProps = {
  packageUpdates: [
    {
      packageName: "react",
      versions: [
        {
          version: "19.0.0",
          publishedAt: new Date("2024-12-01"),
        },
        {
          version: "18.3.1",
          publishedAt: new Date("2024-11-15"),
        },
      ],
      changelogs: {
        "19.0.0": {
          version: "19.0.0",
          content:
            "<p>React 19 includes new features like Actions, useOptimistic, and improved hydration.</p>",
          url: "https://react.dev/blog/2024/12/05/react-19",
          publishedAt: "2024-12-01",
        },
        "18.3.1": {
          version: "18.3.1",
          content: "<p>Bug fixes and performance improvements.</p>",
          url: "https://github.com/facebook/react/releases/tag/v18.3.1",
          publishedAt: "2024-11-15",
        },
      },
    },
    {
      packageName: "next",
      versions: [
        {
          version: "15.0.0",
          publishedAt: new Date("2024-11-20"),
        },
      ],
      changelogs: {
        "15.0.0": {
          version: "15.0.0",
          content:
            "<p>Next.js 15 introduces React 19 support and improved caching.</p>",
          url: "https://nextjs.org/blog/next-15",
          publishedAt: "2024-11-20",
        },
      },
    },
  ],
  unsubscribeLink: "https://updated.email/unsubscribe/token123",
  dashboardLink: "https://updated.email/dashboard",
} satisfies NewsletterEmailProps;

export default NewsletterEmail;
