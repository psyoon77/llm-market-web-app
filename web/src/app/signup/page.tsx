"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (!username || !password) {
      setError("Username and password are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Signup failed");
        setLoading(false);
        return;
      }

      const login = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (login?.error) {
        router.replace("/login");
        router.refresh();
        return;
      }

      router.replace("/products");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-md p-4 sm:p-5 md:p-6">
      <div className="border rounded-xl p-4 sm:p-6 bg-white shadow-sm space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">Sign Up</h1>
          <p className="text-sm text-gray-500">
            Create a local account to post products and manage your profile.
          </p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              name="username"
              type="text"
              placeholder="Username"
              className="w-full min-h-[44px] border rounded px-3 py-2"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full min-h-[44px] border rounded px-3 py-2"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 w-full"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
