import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type WaitlistConfirmationEmailProps = {
  recipientEmail: string;
};

export function WaitlistConfirmationEmail({
  recipientEmail,
}: WaitlistConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You're signed up for the updated.email waitlist!</Preview>
      <Tailwind>
        <Body className="bg-[#f8f8f7] p-6 text-[#11181c] font-sans">
          <Container className="max-w-[520px] mx-auto">
            <Section className="bg-white rounded-[18px] p-8">
              <Text className="uppercase text-xs tracking-wider text-[#687076] m-0 mb-3">
                updated.email waitlist
              </Text>
              <Heading className="text-[28px] m-0 mb-4 leading-[1.3] text-[#11181c]">
                You&apos;re signed up! 🎉
              </Heading>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#11181c]">
                Thanks for joining the updated.email waitlist! We&apos;ve added{" "}
                <strong>{recipientEmail}</strong> to our list.
              </Text>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#11181c]">
                We&apos;re working hard to bring you a curated weekly brief on
                new releases, breaking changes, and adoption signals for the
                packages you depend on.
              </Text>
              <Text className="text-[15px] leading-[1.6] m-0 mb-4 text-[#11181c]">
                We&apos;ll let you know as soon as updated.email is ready. Until
                then, stay tuned!
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

WaitlistConfirmationEmail.PreviewProps = {
  recipientEmail: "user@example.com",
} satisfies WaitlistConfirmationEmailProps;

export default WaitlistConfirmationEmail;
