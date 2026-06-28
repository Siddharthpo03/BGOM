"use client";

import React, { useState, useEffect } from "react";
import { erpService } from "../../../src/utils/erpService";

export default function VouchersPage() {
  const [companyId, setCompanyId] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Transaction state mappings
  const [type, setType] = useState<"SALES" | "PURCHASE">("SALES");
  const [partyId, setPartyId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("selectedCompanyId") || "";
    setCompanyId(id);
    if (id) loadMasterContext(id);
  }, []);

  const loadMasterContext = async (id: string) => {
    try {
      const [custData, itemData] = await Promise.all([
        erpService.getCustomers(id),
        erpService.getStockItems(id),
      ]);
      setCustomers(custData);
      setStockItems(itemData);
      if (custData.length > 0) setPartyId(custData[0].id);
      if (itemData.length > 0) {
        setSelectedItemId(itemData[0].id);
        setPrice(itemData[0].sellingPrice.toString());
      }
    } catch (err) {
      setError("Failed to fetch transactional master fields.");
    } finally {
      setLoading(false);
    }
  };

  // Sync pricing values automatically when item dropdown changes
  const handleItemChange = (itemId: string) => {
    setSelectedItemId(itemId);
    const targetItem = stockItems.find((i) => i.id === itemId);
    if (targetItem) {
      setPrice(
        type === "SALES"
          ? targetItem.sellingPrice.toString()
          : targetItem.purchasePrice.toString(),
      );
    }
  };

  const handlePostVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!partyId || !selectedItemId || !price || !quantity) {
      setError("Please complete all required voucher layout inputs.");
      return;
    }

    try {
      const payload = {
        type,
        partyId,
        items: [
          {
            stockItemId: selectedItemId,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            taxAmount: parseFloat(price) * parseInt(quantity) * 0.18, // 18% standard analytical computation
          },
        ],
      };

      await erpService.createVoucher(companyId, payload);
      setSuccess(
        `${type} Voucher filed and executed completely inside Neon DB.`,
      );
      setQuantity("1");
      // Re-fetch master state to synchronize newly mutated inventory values on-screen
      await loadMasterContext(companyId);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Voucher execution rejected by server.",
      );
    }
  };

  if (loading)
    return (
      <div className="text-gray-400 font-medium">Loading ledger records...</div>
    );

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          Voucher Entry Desk
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Execute direct inventory invoices against live company accounts.
        </p>
      </div>

      {success && (
        <div className="bg-green-950/40 border border-green-800 text-green-400 p-4 rounded-xl text-sm text-center font-semibold">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-400 p-4 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      <form
        onSubmit={handlePostVoucher}
        className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-md space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Voucher Configuration */}
          <div>
            <label className="text-xs text-gray-500 font-mono uppercase block mb-1.5">
              Voucher Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="SALES">
                📦 SALES INVOICE (Reduces Inventory)
              </option>
              <option value="PURCHASE">
                📥 PURCHASE INVOICE (Increments Inventory)
              </option>
            </select>
          </div>

          {/* Account Mapping */}
          <div>
            <label className="text-xs text-gray-500 font-mono uppercase block mb-1.5">
              Account / Party Ledger
            </label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              {customers.length === 0 && (
                <option>No active party records found</option>
              )}
            </select>
          </div>
        </div>

        <hr className="border-gray-800" />

        {/* Line Item Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-300 font-mono uppercase tracking-wider">
            Line Inventory Assignment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Catalog Item
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => handleItemChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {stockItems.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Qty: {i.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Rate (₹)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm tracking-wide shadow-md shadow-blue-600/10 transition-colors"
        >
          Execute Database Ledger Transaction 🚀
        </button>
      </form>
    </div>
  );
}
