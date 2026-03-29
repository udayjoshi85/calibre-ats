"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/jobs");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-brand-dark relative overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <div className="mb-8">
            {/* Logo */}
            <div className="mb-8 bg-[#1a1a2e]/80 backdrop-blur-sm rounded-2xl p-6 inline-block">
              <Image
                src="/logo.png"
                alt="Calibre"
                width={400}
                height={120}
                className="h-28 w-auto"
                priority
              />
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
              Unlocking Human<br />Potential. Defined.
            </h2>
            <p className="text-lg text-white/70 max-w-md">
              AI-powered resume screening that extracts meaningful signals beyond keywords.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mt-8">
            {[
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", text: "Instant AI Analysis", color: "bg-cyan-500/20 text-cyan-400" },
              { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", text: "9 Signal Scoring System", color: "bg-blue-500/20 text-blue-400" },
              { icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", text: "Smart Recommendations", color: "bg-amber-500/20 text-amber-400" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-mesh">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-block bg-[#1a1a2e] rounded-xl p-4">
              <Image
                src="/logo.png"
                alt="Calibre"
                width={240}
                height={70}
                className="h-16 w-auto"
                priority
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-500">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-[#1a1a2e] focus:ring-[#1a1a2e]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-[#1a1a2e] focus:ring-[#1a1a2e]/20 transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl btn-primary text-base"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="loading-dots text-white">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-[#1a1a2e] hover:text-[#252545] font-semibold transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Unlocking Human Potential. Defined.
          </p>
        </div>
      </div>
    </div>
  );
}
