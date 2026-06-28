"use client";

import React, { useEffect, useState } from "react";
import { erpService } from "../../src/utils/erpService";

interface Metrics {
  revenue: number;
  taxCollected: number;
  expenses: number;
  taxPaid: number;
  receivables: number;
  payables: number;
  netProfit: number;
}

interface AlertItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const companyId = localStorage.getItem("selectedCompanyId");
      if (!companyId) {
        setError("No company context loaded.");
        setLoading(false);
        return;
      }

      try {
        const response = await erpService.getDashboardMetrics(companyId);
        setMetrics(response.metrics);
        setAlerts(response.inventoryAlerts || []);
      } catch (err) {
        console.error(err);
        setError("Error rendering live analytical feeds.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="text-gray-400 font-medium">
        Querying ledger analytical balances...
      </div>
    );
  if (error)
    return (
      <div className="text-red-400 text-sm bg-red-950/30 p-4 border border-red-900 rounded-xl">
        {error}
      </div>
    );

  const cards = [
    {
      title: "Total Revenue Volume",
      val: `₹${metrics?.revenue.toLocaleString()}`,
      color: "text-green-400",
    },
    {
      title: "Operating Expenses",
      val: `₹${metrics?.expenses.toLocaleString()}`,
      color: "text-orange-400",
    },
    {
      title: "Net Profit Margin",
      val: `₹${metrics?.netProfit.toLocaleString()}`,
      color:
        metrics && metrics.netProfit >= 0 ? "text-blue-400" : "text-red-400",
    },
    {
      title: "Accounts Receivables",
      val: `₹${metrics?.receivables.toLocaleString()}`,
      color: "text-indigo-400",
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          Real-Time Core Metrics
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Live structural cash flow computation from active ledger records.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-sm space-y-2"
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {c.title}
            </span>
            <p className={`text-2xl font-black tracking-tight ${c.color}`}>
              {c.val}
            </p>
          </div>
        ))}
      </div>

      {/* Inventory Alerts Subsystem */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-200 mb-4">
          ⚠️ Low Stock Inventory Warnings (Threshold &lt; 10 Units)
        </h3>
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500">
            All current system inventory item quantities are within stable
            operational parameters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs text-gray-500 uppercase font-mono border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4 text-right">
                    Available Stock Units
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {alerts.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-850/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-gray-200">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{item.sku}</td>
                    <td className="py-3 px-4 text-right font-black text-red-400">
                      {item.quantity} units
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
