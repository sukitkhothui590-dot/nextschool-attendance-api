import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-5 text-center">
      <div>
        <p className="text-5xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-text-secondary">
          This page is not available in Attendance Operations.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block font-semibold text-primary hover:underline"
        >
          Return to overview
        </Link>
      </div>
    </main>
  );
}
