export const ENDPOINTS = Object.freeze({
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
    refresh: "/auth/refresh",
  },
  accounts: {
    base: "/accounts",
    BY_ID: (id: number) => `/accounts/${id}`,
  },
  transactions: {
    base: "/transactions",
    BY_ID: (id: number) => `/transactions/${id}`,
    BY_ACCOUNT: (accountId: number) => `/transactions/account/${accountId}`,
  },
  categories: {
    base: "/categories",
    BY_ID: (id: number) => `/categories/${id}`,
    global: "/categories/global",
  },
  users: {
    base: "/users",
    BY_ID: (id: number) => `/users/${id}`,
  },
});
