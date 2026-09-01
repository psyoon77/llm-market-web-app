"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const displayName =
    session?.user?.name ||
    (session?.user as any)?.username ||
    session?.user?.email ||
    "Account";

  async function handleLogout() {
    await signOut({ redirect: false });
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-10 space-y-6">
      <div className="border rounded-2xl bg-white shadow-sm p-5 sm:p-8 md:p-10 space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold break-words">
            Welcome to Marketplace
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Discover products from users, manage your profile, and share your own listings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded bg-blue-600 text-white w-full sm:w-auto"
          >
            View Products
          </Link>

          {session?.user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded border border-gray-300 w-full sm:w-auto break-words"
            >
              Logout ({displayName})
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded border border-gray-300 w-full sm:w-auto"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      <div className="border rounded-2xl bg-white shadow-sm p-4 sm:p-6 md:p-7 space-y-4 text-center">
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-black break-words">
            Marketplace AI Chat Assistant
          </h2>
          <p className="text-gray-600 text-sm sm:text-sm max-w-2xl mx-auto">
            {session?.user
              ? "User ID's Chat: trailing 20 messages are remembered, and your chat is saved for later."
              : "Guest mode: trailing 10 messages are remembered for this session."}
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded bg-sky-500 hover:bg-sky-600 text-white"
          >
            Open Chat
          </Link>
        </div>
      </div>
    </div>
  );
}
