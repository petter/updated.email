import type { CSSProperties } from "react";

type WaitlistConfirmationEmailProps = {
  recipientEmail: string;
};

export function WaitlistConfirmationEmail({
  recipientEmail,
}: WaitlistConfirmationEmailProps) {
  return (
    <div style={styles.body}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={styles.card}>
        <tbody>
          <tr>
            <td>
              <p style={styles.kicker}>updated.email waitlist</p>
              <h1 style={styles.title}>You&apos;re signed up! 🎉</h1>
              <p style={styles.paragraph}>
                Thanks for joining the updated.email waitlist! We&apos;ve added{" "}
                <strong>{recipientEmail}</strong> to our list.
              </p>
              <p style={styles.paragraph}>
                We&apos;re working hard to bring you a curated weekly brief on
                new releases, breaking changes, and adoption signals for the
                packages you depend on.
              </p>
              <p style={styles.paragraph}>
                We&apos;ll let you know as soon as updated.email is ready. Until
                then, stay tuned!
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
  signature: {
    fontWeight: 600,
    marginTop: "24px",
  },
};
