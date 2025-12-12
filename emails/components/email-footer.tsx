import { Link, Row, Section, Text } from "@react-email/components";

type EmailFooterProps = {
  unsubscribeLink?: string;
};

export function EmailFooter({ unsubscribeLink }: EmailFooterProps) {
  return (
    <Section className="mt-6 pt-4 border-t border-[#f5d5d5]">
      <Row>
        <Text
          className="text-[13px] leading-[1.6] m-0 mb-3 text-[#9d7a7a]"
          style={{ textAlign: "center" }}
        >
          Made with ❤️ by{" "}
          <Link
            href="https://www.pmoen.me/"
            className="text-[#9d7a7a]"
            style={{ textDecoration: "underline" }}
          >
            Petter Moen
          </Link>
        </Text>
      </Row>
      {unsubscribeLink && (
        <Row>
          <Text
            className="text-[13px] leading-[1.6] m-0 text-[#9d7a7a]"
            style={{ textAlign: "center" }}
          >
            <Link
              href={unsubscribeLink}
              className="text-[#9d7a7a] no-underline"
            >
              Unsubscribe from these emails
            </Link>
          </Text>
        </Row>
      )}
    </Section>
  );
}
