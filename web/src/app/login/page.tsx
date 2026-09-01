"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSigningIn(true);

    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (!username || !password) {
      setError("Username and password are required.");
      setIsSigningIn(false);
      return;
    }

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid username or password.");
      setIsSigningIn(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <div className="container mx-auto max-w-md p-4 sm:p-5 md:p-6">
      <div className="border rounded-xl p-4 sm:p-6 bg-white shadow-sm space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">Sign In</h1>
          <p className="text-sm text-gray-500">
            Use the local account credentials stored in this environment.
          </p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="w-full min-h-[44px] border rounded px-3 py-2"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full min-h-[44px] border rounded px-3 py-2"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSigningIn}
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50 w-full"
          >
            {isSigningIn ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
