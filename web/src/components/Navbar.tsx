"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName =
    session?.user?.name ||
    (session?.user as any)?.username ||
    session?.user?.email ||
    "Account";

  async function handleLogout() {
    await signOut({ redirect: false });
    setMenuOpen(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <nav className="bg-white shadow px-3 sm:px-4 py-3">
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="font-bold text-xl md:text-2xl">
            Marketplace
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm"
            aria-label="Toggle menu"
          >
            Menu
          </button>

          <div className="hidden lg:flex lg:flex-wrap lg:items-center gap-2 sm:gap-3 md:gap-4 text-sm md:text-base">
            <Link href="/" className="inline-flex items-center min-h-[44px] px-3 py-2 rounded hover:bg-gray-50">
              Home
            </Link>

            <Link href="/products" className="inline-flex items-center min-h-[44px] px-3 py-2 rounded hover:bg-gray-50">
              Products
            </Link>

            {status === "loading" ? (
              <>
                <div className="inline-flex items-center min-h-[44px] px-3 py-2 rounded text-gray-400">My Profile</div>
                <div className="inline-flex items-center min-h-[44px] px-3 py-2 rounded text-gray-400">My Products</div>
                <div className="inline-flex items-center min-h-[44px] px-3 py-2 rounded text-gray-400">Chat</div>
                <div className="inline-flex items-center min-h-[44px] px-3 py-2 rounded text-gray-400">Logout</div>
              </>
            ) : session?.user ? (
              <>
                <Link href="/profile" className="inline-flex items-center min-h-[44px] px-3 py-2 rounded hover:bg-gray-50">
                  My Profile
                </Link>

                <Link href="/my-products" className="inline-flex items-center min-h-[44px] px-3 py-2 rounded hover:bg-gray-50">
                  My Products
                </Link>

                <Link href="/chat" className="inline-flex items-center min-h-[44px] px-3 py-2 rounded hover:bg-gray-50">
                  Chat
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center min-h-[44px] px-3 py-2 rounded text-left hover:bg-gray-50 break-words"
                >
                  Logout ({displayName})
                </button>
              </>
            ) : (
              <>
                <Link href="/chat" className="inline-flex items-center min-h-[44px] px-3 py-2 rounded hover:bg-gray-50">
                  Chat
                </Link>

                <Link href="/login" className="inline-flex items-center min-h-[44px] px-3 py-2 rounded hover:bg-gray-50">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden mt-3 border rounded-xl bg-white shadow-sm p-2 flex flex-col gap-1 text-sm">
            <Link href="/" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded hover:bg-gray-50">
              Home
            </Link>

            <Link href="/products" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded hover:bg-gray-50">
              Products
            </Link>

            {status === "loading" ? (
              <>
                <div className="px-3 py-2 rounded text-gray-400">My Profile</div>
                <div className="px-3 py-2 rounded text-gray-400">My Products</div>
                <div className="px-3 py-2 rounded text-gray-400">Chat</div>
                <div className="px-3 py-2 rounded text-gray-400">Logout</div>
              </>
            ) : session?.user ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded hover:bg-gray-50">
                  My Profile
                </Link>

                <Link href="/my-products" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded hover:bg-gray-50">
                  My Products
                </Link>

                <Link href="/chat" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded hover:bg-gray-50">
                  Chat
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded text-left hover:bg-gray-50"
                >
                  Logout ({displayName})
                </button>
              </>
            ) : (
              <>
                <Link href="/chat" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded hover:bg-gray-50">
                  Chat
                </Link>

                <Link href="/login" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded hover:bg-gray-50">
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
