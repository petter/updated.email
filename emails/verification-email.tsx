import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";

type VerificationEmailProps = {
  validationLink: string;
  unsubscribeLink?: string;
};

export function VerificationEmail({
  validationLink,
  unsubscribeLink,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your subscription to updated.email</Preview>
      <Tailwind>
        <Body className="bg-[#fef5f5] p-6 text-[#2d1a1a] font-sans">
          <Container className="max-w-[520px] mx-auto">
            <Section className="bg-[#fffefe] rounded-[18px] p-8">
              <EmailHeader heading="Confirm your subscription" />
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#2d1a1a]">
                Thanks for signing up for updated.email! Please confirm your
                subscription by clicking the link below.
              </Text>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#2d1a1a]">
                <Link
                  href={validationLink}
                  className="text-[#dc2626] no-underline font-semibold"
                >
                  Confirm Subscription
                </Link>
              </Text>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#2d1a1a]">
                If you didn't sign up for this, you can safely ignore this
                email.
              </Text>
              <EmailFooter unsubscribeLink={unsubscribeLink} />
              <Text className="font-semibold mt-6 m-0 text-[#2d1a1a]">
                — The updated.email team
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

VerificationEmail.PreviewProps = {
  validationLink: "https://updated.email/verify/token123",
  unsubscribeLink: "https://updated.email/unsubscribe/token123",
} satisfies VerificationEmailProps;

export default VerificationEmail;
