"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo & Nav */}
            <div className="flex items-center gap-8">
              <Link href="/jobs" className="flex items-center group">
                <div className="bg-[#1a1a2e] rounded-xl p-2">
                  <Image
                    src="/logo.png"
                    alt="Calibre"
                    width={180}
                    height={50}
                    className="h-12 w-auto"
                    priority
                  />
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/jobs"
                  className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    pathname.startsWith("/jobs")
                      ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Jobs
                  </span>
                </Link>
              </nav>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" className="gap-3 rounded-xl hover:bg-white/5 px-3 text-gray-300" />
              }>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-cyan-500/25">
                  {user?.email?.[0].toUpperCase() || "U"}
                </div>
                <span className="hidden sm:inline text-sm text-gray-300 font-medium max-w-[150px] truncate">
                  {user?.email}
                </span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#1a1a2e] border-white/10">
                <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
