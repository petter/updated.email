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
import type { PackageUpdateResult } from "@/lib/npm";
import type { ChangelogEntry } from "@/lib/types";
import { EmailFooter } from "./email-footer";

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
        <Body className="bg-[#f8f8f7] p-6 text-[#11181c] font-sans">
          <Container className="max-w-[600px] mx-auto">
            <Section className="bg-white rounded-[18px] p-8">
              <Text className="uppercase text-xs tracking-wider text-[#687076] m-0 mb-3">
                updated.email
              </Text>
              <Heading className="text-[28px] m-0 mb-4 leading-[1.3] text-[#11181c]">
                Your Weekly Package Updates
              </Heading>
              {!hasUpdates ? (
                <Text className="text-[15px] leading-[1.6] m-0 mb-6 text-[#11181c]">
                  No new updates this week for the packages you're subscribed
                  to. Check back next week!
                </Text>
              ) : (
                <>
                  <Text className="text-[15px] leading-[1.6] m-0 mb-6 text-[#11181c]">
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
                        className="mb-8 pb-6 border-b border-neutral-200"
                      >
                        <Heading
                          as="h2"
                          className="text-xl font-semibold m-0 mb-4 text-[#11181c]"
                        >
                          {pkg.packageName}
                        </Heading>
                        {pkg.versions.map((version) => {
                          const changelog = pkg.changelogs[version.version];
                          return (
                            <Section
                              key={version.version}
                              className="mb-5 pl-4 border-l-[3px] border-[#0070f3]"
                            >
                              <Row>
                                <Column className="w-auto align-middle pr-3">
                                  <Text className="text-sm font-semibold text-[#0070f3] bg-[#e6f2ff] px-[10px] py-1 rounded-md m-0 inline-block">
                                    {version.version}
                                  </Text>
                                </Column>
                                <Column className="w-auto align-middle">
                                  <Text className="text-[13px] text-[#687076] m-0">
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
                                  className="text-sm leading-[1.6] text-[#11181c] mb-2"
                                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Changelog content is HTML from GitHub releases API
                                  dangerouslySetInnerHTML={{
                                    __html: changelog.content,
                                  }}
                                />
                              ) : (
                                <Text className="text-sm text-[#687076] italic mb-2 m-0">
                                  No changelog available for this version.
                                </Text>
                              )}
                              {changelog?.url && (
                                <Text className="mt-2 m-0">
                                  <Link
                                    href={changelog.url}
                                    className="text-sm text-[#0070f3] no-underline font-medium"
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
                    className="bg-[#0070f3] text-white text-[15px] font-semibold px-6 py-3 rounded-lg no-underline leading-[1.5] inline-block"
                  >
                    Go to dashboard
                  </Button>
                </Section>
              )}
              <EmailFooter unsubscribeLink={unsubscribeLink} />
              <Text className="font-semibold mt-6 m-0 text-[#11181c]">
                — The updated.email team
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
