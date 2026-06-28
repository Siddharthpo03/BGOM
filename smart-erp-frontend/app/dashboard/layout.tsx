"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("selectedCompanyId");
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }
      if (!storedId && pathname !== "/dashboard/companies") {
        router.push("/dashboard/companies");
        return;
      }
      setCompanyId(storedId);
    }
  }, [router, pathname]);

  const navItems = [
    { name: "🎛️ Live Metrics", path: "/dashboard" },
    { name: "🏢 Change Company", path: "/dashboard/companies" },
    { name: "📁 Masters Ledger", path: "/dashboard/masters" },
    { name: "🧾 Voucher Entry", path: "/dashboard/vouchers" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-950 text-white">
      {/* Structural Control Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div className="px-2">
            <span className="text-xl font-black tracking-tight text-white">
              Smart<span className="text-blue-500">ERP</span> Panel
            </span>
            {companyId && (
              <p className="text-[10px] text-gray-500 font-mono mt-1 truncate">
                WORKSPACE: {companyId}
              </p>
            )}
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            router.push("/login");
          }}
          className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-xl transition-colors border border-transparent hover:border-red-900/50"
        >
          🚪 End System Session
        </button>
      </aside>

      {/* Primary Display Surface */}
      <main className="flex-1 overflow-y-auto p-10 bg-gray-950">
        {children}
      </main>
    </div>
  );
}
