import "../styles/globals.css";
import type { ReactNode } from "react";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "LLM Market Web App",
  description: "Marketplace and local-LLM chat portfolio application",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="container mx-auto px-3 sm:px-4 md:px-6 py-5 sm:py-6 md:py-8 flex-1">
              {children}
            </main>
            <footer className="border-t bg-white">
              <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 text-center text-sm text-gray-500">
                Marketplace
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
