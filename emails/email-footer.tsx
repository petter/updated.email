import { Link, Section, Text } from "@react-email/components";

type EmailFooterProps = {
  unsubscribeLink?: string;
};

export function EmailFooter({ unsubscribeLink }: EmailFooterProps) {
  if (!unsubscribeLink) {
    return null;
  }

  return (
    <Section className="mt-6 pt-4 border-t border-neutral-200">
      <Text className="text-[13px] leading-[1.6] m-0 text-[#687076]">
        <Link href={unsubscribeLink} className="text-[#687076] no-underline">
          Unsubscribe from these emails
        </Link>
      </Text>
    </Section>
  );
}
