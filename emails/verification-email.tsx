import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
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
        <Body className="bg-[#fef5f5] p-6 text-[#2d1a1a] font-sans">
          <Container className="max-w-[520px] mx-auto">
            <Section className="bg-[#fffefe] rounded-[18px] p-8">
              <Img
                src="https://updated.email/logo.svg"
                alt="updated.email"
                width="40"
                height="40"
                className="mb-4"
              />
              <Text className="uppercase text-xs tracking-wider text-[#9d7a7a] m-0 mb-3">
                updated.email
              </Text>
              <Heading className="text-[28px] m-0 mb-4 leading-[1.3] text-[#2d1a1a]">
                Confirm your subscription
              </Heading>
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
