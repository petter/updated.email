import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { EmailFooter } from "./email-footer";

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
        <Body className="bg-[#f8f8f7] p-6 text-[#11181c] font-sans">
          <Container className="max-w-[520px] mx-auto">
            <Section className="bg-white rounded-[18px] p-8">
              <Text className="uppercase text-xs tracking-wider text-[#687076] m-0 mb-3">
                updated.email
              </Text>
              <Heading className="text-[28px] m-0 mb-4 leading-[1.3] text-[#11181c]">
                Confirm your subscription
              </Heading>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#11181c]">
                Thanks for signing up for updated.email! Please confirm your
                subscription by clicking the link below.
              </Text>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#11181c]">
                <Link
                  href={validationLink}
                  className="text-[#0070f3] no-underline font-semibold"
                >
                  Confirm Subscription
                </Link>
              </Text>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#11181c]">
                If you didn't sign up for this, you can safely ignore this
                email.
              </Text>
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
