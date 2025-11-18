import type { CSSProperties } from "react";

type NewsletterPreviewEmailProps = {
  recipientEmail: string;
  previewUrl?: string;
  packages?: string[];
};

export function NewsletterPreviewEmail({
  recipientEmail,
  previewUrl,
  packages = [],
}: NewsletterPreviewEmailProps) {
  return (
    <div style={styles.body}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={styles.card}>
        <tbody>
          <tr>
            <td>
              <p style={styles.kicker}>updated.email preview</p>
              <h1 style={styles.title}>You’re on the list! 🎉</h1>
              <p style={styles.paragraph}>
                updated.email will use <strong>{recipientEmail}</strong> for
                your preview issues. Expect a weekly recap that highlights
                releases, breaking changes, and adoption signals for the
                packages you depend on.
              </p>

              {packages.length > 0 ? (
                <div style={styles.section}>
                  <p style={styles.subheading}>Packages you care about:</p>
                  <ul style={styles.list}>
                    {packages.map((pkg) => (
                      <li key={pkg} style={styles.listItem}>
                        {pkg}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={styles.paragraph}>
                  We’ll ping you soon so you can add the packages that matter
                  most.
                </p>
              )}

              {previewUrl && (
                <p style={styles.paragraph}>
                  You can always open the freshest preview here:{" "}
                  <a href={previewUrl} style={styles.link}>
                    {previewUrl}
                  </a>
                </p>
              )}

              <p style={styles.paragraph}>
                Until then, the updated.email feed is combing through changelogs
                so you don’t have to.
              </p>

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
    maxWidth: "520px",
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
    margin: "0 0 16px",
  },
  section: {
    marginBottom: "16px",
  },
  subheading: {
    fontSize: "15px",
    fontWeight: 600,
    margin: "0 0 8px",
  },
  list: {
    paddingLeft: "20px",
    margin: 0,
  },
  listItem: {
    marginBottom: "6px",
  },
  link: {
    color: "#0f62fe",
    textDecoration: "none",
  },
  signature: {
    fontWeight: 600,
    marginTop: "24px",
  },
};
