import type { CSSProperties } from "react";
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
    <div style={styles.body}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={styles.card}>
        <tbody>
          <tr>
            <td>
              <p style={styles.kicker}>updated.email</p>
              <h1 style={styles.title}>Your Weekly Package Updates</h1>
              {!hasUpdates ? (
                <p style={styles.paragraph}>
                  No new updates this week for the packages you're subscribed
                  to. Check back next week!
                </p>
              ) : (
                <>
                  <p style={styles.paragraph}>
                    Here are the latest updates for the packages you're
                    following:
                  </p>
                  {packageUpdates.map((pkg) => {
                    if (pkg.error || pkg.versions.length === 0) {
                      return null;
                    }

                    return (
                      <div key={pkg.packageName} style={styles.packageSection}>
                        <h2 style={styles.packageName}>{pkg.packageName}</h2>
                        {pkg.versions.map((version) => {
                          const changelog = pkg.changelogs[version.version];
                          return (
                            <div
                              key={version.version}
                              style={styles.versionSection}
                            >
                              <div style={styles.versionHeader}>
                                <span style={styles.versionBadge}>
                                  {version.version}
                                </span>
                                <span style={styles.versionDate}>
                                  {new Date(
                                    version.publishedAt,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              {changelog ? (
                                <div
                                  style={styles.changelog}
                                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Changelog content is HTML from GitHub releases API
                                  dangerouslySetInnerHTML={{
                                    __html: changelog.content,
                                  }}
                                />
                              ) : (
                                <p style={styles.noChangelog}>
                                  No changelog available for this version.
                                </p>
                              )}
                              {changelog?.url && (
                                <a
                                  href={changelog.url}
                                  style={styles.releaseLink}
                                >
                                  View release →
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </>
              )}
              {dashboardLink && (
                <div style={styles.dashboardSection}>
                  <a href={dashboardLink} style={styles.dashboardButton}>
                    Go to dashboard
                  </a>
                </div>
              )}
              <EmailFooter unsubscribeLink={unsubscribeLink} />
              <p style={styles.signature}>— The updated.email team</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  body: {
    backgroundColor: "#f8f8f7",
    padding: "24px",
    color: "#11181c",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "32px",
  },
  kicker: {
    textTransform: "uppercase",
    fontSize: "12px",
    letterSpacing: "0.1em",
    color: "#687076",
    marginBottom: "12px",
  },
  title: {
    fontSize: "28px",
    margin: "0 0 16px",
    lineHeight: 1.3,
  },
  paragraph: {
    fontSize: "15px",
    lineHeight: 1.6,
    margin: "0 0 24px",
  },
  packageSection: {
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e5e5e5",
  },
  packageName: {
    fontSize: "20px",
    fontWeight: 600,
    margin: "0 0 16px",
    color: "#11181c",
  },
  versionSection: {
    marginBottom: "20px",
    paddingLeft: "16px",
    borderLeft: "3px solid #0070f3",
  },
  versionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  versionBadge: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#0070f3",
    backgroundColor: "#e6f2ff",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  versionDate: {
    fontSize: "13px",
    color: "#687076",
  },
  changelog: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#11181c",
    marginBottom: "8px",
  },
  noChangelog: {
    fontSize: "14px",
    color: "#687076",
    fontStyle: "italic",
    marginBottom: "8px",
  },
  releaseLink: {
    fontSize: "14px",
    color: "#0070f3",
    textDecoration: "none",
    fontWeight: 500,
  },
  dashboardSection: {
    marginTop: "32px",
    marginBottom: "24px",
    textAlign: "center" as const,
  },
  dashboardButton: {
    display: "inline-block",
    backgroundColor: "#0070f3",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 600,
    padding: "12px 24px",
    borderRadius: "8px",
    textDecoration: "none",
    lineHeight: 1.5,
  },
  signature: {
    fontWeight: 600,
    marginTop: "24px",
  },
};
