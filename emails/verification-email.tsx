import type { CSSProperties } from "react";

type VerificationEmailProps = {
  validationLink: string;
};

export function VerificationEmail({ validationLink }: VerificationEmailProps) {
  return (
    <div style={styles.body}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={styles.card}>
        <tbody>
          <tr>
            <td>
              <p style={styles.kicker}>updated.email</p>
              <h1 style={styles.title}>Confirm your subscription</h1>
              <p style={styles.paragraph}>
                Thanks for signing up for updated.email! Please confirm your
                subscription by clicking the link below.
              </p>
              <p style={styles.paragraph}>
                <a href={validationLink} style={styles.link}>
                  Confirm Subscription
                </a>
              </p>
              <p style={styles.paragraph}>
                If you didn't sign up for this, you can safely ignore this
                email.
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
  link: {
    color: "#0070f3",
    textDecoration: "none",
    fontWeight: 600,
  },
  signature: {
    fontWeight: 600,
    marginTop: "24px",
  },
};
