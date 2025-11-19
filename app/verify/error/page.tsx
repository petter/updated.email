export default async function VerifyErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        {message || "Invalid or expired token."}
      </p>
    </div>
  );
}
