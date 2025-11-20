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

type LoginEmailProps = {
  loginLink: string;
};

export function LoginEmail({ loginLink }: LoginEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sign in to your updated.email dashboard</Preview>
      <Tailwind>
        <Body className="bg-[#f8f8f7] p-6 text-[#11181c] font-sans">
          <Container className="max-w-[520px] mx-auto">
            <Section className="bg-white rounded-[18px] p-8">
              <Text className="uppercase text-xs tracking-wider text-[#687076] m-0 mb-3">
                updated.email
              </Text>
              <Heading className="text-[28px] m-0 mb-4 leading-[1.3] text-[#11181c]">
                Sign in to your account
              </Heading>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#11181c]">
                Click the link below to sign in to your updated.email dashboard.
                This link will expire in 30 days.
              </Text>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#11181c]">
                <Link
                  href={loginLink}
                  className="text-[#0070f3] no-underline font-semibold"
                >
                  Sign In
                </Link>
              </Text>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#11181c]">
                If you didn't request this login link, you can safely ignore
                this email.
              </Text>
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
