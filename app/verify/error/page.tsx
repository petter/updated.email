export default async function VerifyErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-destructive">
        Verification Failed
      </h1>
      <p className="mt-2 text-muted-foreground">
        {message || "Invalid or expired token."}
      </p>
    </div>
  );
}
