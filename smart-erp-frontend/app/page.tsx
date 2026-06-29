"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between selection:bg-blue-600/30">
      {/* Structural Header Navigation */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between border-b border-gray-900/60">
        <span className="text-xl font-black tracking-tight text-white">
          Smart<span className="text-blue-500">ERP</span> Core
        </span>
        <div className="flex items-center gap-4">
          <Link
            href={isLoggedIn ? "/dashboard/companies" : "/login"}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-blue-600/10 hover:scale-[1.02]"
          >
            {isLoggedIn ? "Go to Workspace →" : "Sign In to Engine"}
          </Link>
        </div>
      </header>

      {/* Hero Content Grid Surface */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 bg-blue-950/40 border border-blue-900/60 rounded-full px-4 py-1.5 text-xs text-blue-400 font-mono font-medium">
          🚀 Next-Generation Multi-Tenant Cloud Architecture
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white max-w-2xl">
          Enterprise Accounting &{" "}
          <span className="text-blue-500">Inventory Control</span> Redefined.
        </h1>

        <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto font-normal leading-relaxed">
          A high-performance system engine built with parallel ACID
          transactional models, real-time aggregate data reporting, and dynamic
          workspace isolation parameters.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          <Link
            href={isLoggedIn ? "/dashboard/companies" : "/login"}
            className="w-full sm:w-auto text-center bg-white hover:bg-gray-100 text-gray-950 font-bold px-8 py-3.5 rounded-xl text-sm transition-colors shadow-lg"
          >
            Launch Core Console
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto text-center bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 font-medium px-6 py-3.5 rounded-xl text-sm transition-colors"
          >
            Documentation Map
          </a>
        </div>
      </main>

      {/* Footer Meta Details */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-gray-900/60 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 font-mono">
        <p>© 2026 SmartERP Engine Architecture. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">
          Node Environments: Connected via Neon Postgres
        </p>
      </footer>
    </div>
  );
}
