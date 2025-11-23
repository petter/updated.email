import { Column, Heading, Img, Row, Text } from "@react-email/components";

type EmailHeaderProps = {
  heading: string;
};

export function EmailHeader({ heading }: EmailHeaderProps) {
  return (
    <>
      <Row className="mb-3" align="left">
        <Column align="left" width="50px">
          <Img
            src="https://www.updated.email/logo.svg"
            alt=""
            width="40"
            height="40"
            className="m-0"
            style={{ display: "block" }}
          />
        </Column>
        <Column className="w-max" align="left">
          <Text
            className="uppercase text-xs tracking-wider text-[#9d7a7a] m-0"
            style={{ lineHeight: "40px" }}
          >
            updated.email
          </Text>
        </Column>
      </Row>
      <Heading className="text-[28px] m-0 mb-4 leading-[1.3] text-[#2d1a1a]">
        {heading}
      </Heading>
    </>
  );
}
