import { api } from "./api";

export const erpService = {
  // --- AUTH ---
  login: async (credentials: any) => {
    const res = await api.post("/auth/login", credentials);
    if (res.data.token && typeof window !== "undefined") {
      localStorage.setItem("token", res.data.token);
    }
    return res.data;
  },

  // --- WORKSPACES ---
  getCompanies: async () => {
    const res = await api.get("/companies");
    return res.data;
  },
  createCompany: async (companyData: { name: string }) => {
    const res = await api.post("/companies", companyData);
    return res.data;
  },

  // --- MASTERS ---
  getCustomers: async (companyId: string) => {
    const res = await api.get(`/masters/${companyId}/customers`);
    return res.data;
  },
  createCustomer: async (companyId: string, data: any) => {
    const res = await api.post(`/masters/${companyId}/customers`, data);
    return res.data;
  },
  getStockItems: async (companyId: string) => {
    const res = await api.get(`/masters/${companyId}/stock-items`);
    return res.data;
  },
  createStockItem: async (companyId: string, data: any) => {
    const res = await api.post(`/masters/${companyId}/stock-items`, data);
    return res.data;
  },

  // --- TRANSACTIONS ---
  createVoucher: async (companyId: string, voucherData: any) => {
    const res = await api.post(
      `/transactions/${companyId}/vouchers`,
      voucherData,
    );
    return res.data;
  },

  // --- ANALYTICS ---
  getDashboardMetrics: async (companyId: string) => {
    const res = await api.get(`/reports/${companyId}/dashboard`);
    return res.data;
  },
  getLedgerStatement: async (companyId: string, partyId: string) => {
    const res = await api.get(
      `/reports/${companyId}/ledger-statement?partyId=${partyId}`,
    );
    return res.data;
  },
};
