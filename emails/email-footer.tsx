import type { CSSProperties } from "react";

type EmailFooterProps = {
  unsubscribeLink?: string;
};

export function EmailFooter({ unsubscribeLink }: EmailFooterProps) {
  if (!unsubscribeLink) {
    return null;
  }

  return (
    <p style={styles.footer}>
      <a href={unsubscribeLink} style={styles.footerLink}>
        Unsubscribe from these emails
      </a>
    </p>
  );
}

const styles: Record<string, CSSProperties> = {
  footer: {
    fontSize: "13px",
    lineHeight: 1.6,
    margin: "24px 0 0",
    paddingTop: "16px",
    borderTop: "1px solid #e5e5e5",
    color: "#687076",
  },
  footerLink: {
    color: "#687076",
    textDecoration: "none",
  },
};
