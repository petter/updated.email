import { Link, Section, Text } from "@react-email/components";

type EmailFooterProps = {
  unsubscribeLink?: string;
};

export function EmailFooter({ unsubscribeLink }: EmailFooterProps) {
  if (!unsubscribeLink) {
    return null;
  }

  return (
    <Section className="mt-6 pt-4 border-t border-[#f5d5d5]">
      <Text className="text-[13px] leading-[1.6] m-0 text-[#9d7a7a]">
        <Link href={unsubscribeLink} className="text-[#9d7a7a] no-underline">
          Unsubscribe from these emails
        </Link>
      </Text>
    </Section>
  );
}
