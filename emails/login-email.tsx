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

type LoginEmailProps = {
  loginLink: string;
};

export function LoginEmail({ loginLink }: LoginEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sign in to your updated.email dashboard</Preview>
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
                Sign in to your account
              </Heading>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#2d1a1a]">
                Click the link below to sign in to your updated.email dashboard.
                This link will expire in 30 days.
              </Text>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#2d1a1a]">
                <Link
                  href={loginLink}
                  className="text-[#dc2626] no-underline font-semibold"
                >
                  Sign In
                </Link>
              </Text>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#2d1a1a]">
                If you didn't request this login link, you can safely ignore
                this email.
              </Text>
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

LoginEmail.PreviewProps = {
  loginLink: "https://updated.email/login/token123",
} satisfies LoginEmailProps;

export default LoginEmail;
