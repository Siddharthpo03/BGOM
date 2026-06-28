"use client";

import React, { useState, useEffect } from "react";
import { erpService } from "../../../src/utils/erpService";

export default function MastersPage() {
  const [activeTab, setActiveTab] = useState<"customers" | "items">(
    "customers",
  );
  const [companyId, setCompanyId] = useState<string>("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custMobile, setCustMobile] = useState("");
  const [custAddress, setCustAddress] = useState("");

  const [itemName, setItemName] = useState("");
  const [itemSku, setItemSku] = useState("");
  const [itemPurchase, setItemPurchase] = useState("");
  const [itemSelling, setItemSelling] = useState("");
  const [itemQty, setItemQty] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("selectedCompanyId") || "";
    setCompanyId(id);
    if (id) loadData(id);
  }, []);

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      const [custData, itemData] = await Promise.all([
        erpService.getCustomers(id),
        erpService.getStockItems(id),
      ]);
      setCustomers(custData);
      setStockItems(itemData);
    } catch (err) {
      setError("Failed to load accounting master ledgers.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await erpService.createCustomer(companyId, {
        name: custName,
        email: custEmail || undefined,
        mobile: custMobile || undefined,
        address: custAddress || undefined,
      });
      setCustName("");
      setCustEmail("");
      setCustMobile("");
      setCustAddress("");
      loadData(companyId);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create customer.");
    }
  };

  const handleCreateStockItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await erpService.createStockItem(companyId, {
        name: itemName,
        sku: itemSku,
        purchasePrice: parseFloat(itemPurchase),
        sellingPrice: parseFloat(itemSelling),
        quantity: parseInt(itemQty) || 0,
        gstPercentage: 18,
      });
      setItemName("");
      setItemSku("");
      setItemPurchase("");
      setItemSelling("");
      setItemQty("");
      loadData(companyId);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create stock item.");
    }
  };

  if (loading)
    return (
      <div className="text-gray-400 font-medium">
        Loading ledger metadata...
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Masters Directory
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure structural ledgers, accounts, and catalog inventories.
          </p>
        </div>
        <div className="flex bg-gray-900 p-1 border border-gray-800 rounded-xl">
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "customers" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
          >
            👥 Customers
          </button>
          <button
            onClick={() => setActiveTab("items")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "items" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
          >
            📦 Stock Catalog
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-400 p-3 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Column Form */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl h-fit">
          <h2 className="text-lg font-bold text-gray-200 mb-4">
            Add New Entry
          </h2>
          {activeTab === "customers" ? (
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  Mobile Contact
                </label>
                <input
                  type="text"
                  value={custMobile}
                  onChange={(e) => setCustMobile(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  Billing Address
                </label>
                <textarea
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 h-20"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
              >
                Register Customer
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateStockItem} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  Product Description *
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  Unique SKU Code *
                </label>
                <input
                  type="text"
                  required
                  value={itemSku}
                  onChange={(e) => setItemSku(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-medium block mb-1">
                    Purchase Rate *
                  </label>
                  <input
                    type="number"
                    required
                    value={itemPurchase}
                    onChange={(e) => setItemPurchase(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium block mb-1">
                    Selling Rate *
                  </label>
                  <input
                    type="number"
                    required
                    value={itemSelling}
                    onChange={(e) => setItemSelling(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  Opening Stock Quantity
                </label>
                <input
                  type="number"
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
              >
                Append Stock Catalog
              </button>
            </form>
          )}
        </div>

        {/* Directory View Column */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-200 mb-4">
            Active Database Records
          </h2>
          {activeTab === "customers" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs text-gray-500 border-b border-gray-800 font-mono uppercase">
                  <tr>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Mobile</th>
                    <th className="pb-3 text-right">Receivable Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 text-gray-200 font-semibold">
                        {c.name}
                      </td>
                      <td className="py-3 font-mono text-xs">
                        {c.mobile || "—"}
                      </td>
                      <td className="py-3 text-right text-indigo-400 font-bold">
                        ₹
                        {parseFloat(c.outstandingBalance || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-6 text-gray-600 text-xs"
                      >
                        No customer ledgers registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs text-gray-500 border-b border-gray-800 font-mono uppercase">
                  <tr>
                    <th className="pb-3">Item Name</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3 text-right">Selling Price</th>
                    <th className="pb-3 text-right">Stock Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {stockItems.map((i) => (
                    <tr key={i.id}>
                      <td className="py-3 text-gray-200 font-semibold">
                        {i.name}
                      </td>
                      <td className="py-3 font-mono text-xs text-gray-500">
                        {i.sku}
                      </td>
                      <td className="py-3 text-right text-gray-300">
                        ₹{parseFloat(i.sellingPrice || 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-black text-blue-400">
                        {i.quantity} units
                      </td>
                    </tr>
                  ))}
                  {stockItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-6 text-gray-600 text-xs"
                      >
                        No products configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
