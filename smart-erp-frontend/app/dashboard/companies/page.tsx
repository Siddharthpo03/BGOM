"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { erpService } from "../../../src/utils/erpService";

interface Company {
  id: string;
  name: string;
  gstNumber?: string | null;
  state?: string | null;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch all tenant workspaces linked to this active session token
  const loadCompanies = async () => {
    try {
      setError("");
      const data = await erpService.getCompanies();
      // Handle array unpacking safely depending on API wrap structure
      setCompanies(Array.isArray(data) ? data : data.companies || []);
    } catch (err: any) {
      console.error("Failed to pull workspaces:", err);
      setError("Session expired or database connection timed out.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Handle building a completely brand-new company workspace context
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await erpService.createCompany({ name: newCompanyName });
      setNewCompanyName("");
      await loadCompanies(); // Instantly refresh active list options
    } catch (err: any) {
      setError(err.response?.data?.message || "Workspace creation rejected.");
    } finally {
      setSubmitting(false);
    }
  };

  // Select workspace context and push to active master ledger
  const handleSelectCompany = (companyId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCompanyId", companyId);
    }
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400 font-medium">
        Loading secure multi-tenant workspaces...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-10 mt-12">
        <div className="flex justify-between items-center border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Select your Workspace
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Choose an existing company instance or provision a new one.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-400 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {/* Existing Workspaces Selection List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {companies.map((company) => (
            <div
              key={company.id}
              onClick={() => handleSelectCompany(company.id)}
              className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-blue-500 hover:bg-gray-900/80 cursor-pointer transition-all duration-200 shadow-md flex flex-col justify-between group"
            >
              <div>
                <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">
                  {company.name}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  ID: {company.id}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
                <span>{company.state || "National Workspace"}</span>
                <span className="text-blue-500 font-semibold group-hover:translate-x-1 transition-transform">
                  Launch Engine &rarr;
                </span>
              </div>
            </div>
          ))}

          {companies.length === 0 && (
            <div className="md:col-span-2 text-center py-12 bg-gray-900/40 border border-dashed border-gray-800 rounded-2xl text-gray-500 text-sm">
              No active companies linked to this account profile yet. Use the
              tool below to generate one.
            </div>
          )}
        </div>

        {/* Provision New Company Subsystem */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md max-w-xl">
          <h2 className="text-lg font-bold text-gray-200">
            Create a New Business Workspace
          </h2>
          <form onSubmit={handleCreateCompany} className="mt-4 flex gap-3">
            <input
              type="text"
              required
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              placeholder="e.g., Pulugujja Global Logistics"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? "Provisioning..." : "Add Company"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
