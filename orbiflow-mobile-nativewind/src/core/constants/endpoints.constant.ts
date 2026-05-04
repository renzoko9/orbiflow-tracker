export const ENDPOINTS = Object.freeze({
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
    refresh: "/auth/refresh",
    forgotPassword: "/auth/forgot-password",
    verifyResetCode: "/auth/verify-reset-code",
    resetPassword: "/auth/reset-password",
  },
  accounts: {
    base: "/accounts",
    BY_ID: (id: number) => `/accounts/${id}`,
    ARCHIVED: "/accounts/archived",
    RESTORE: (id: number) => `/accounts/${id}/restore`,
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
    ARCHIVED: "/categories/archived",
    RESTORE: (id: number) => `/categories/${id}/restore`,
  },
  users: {
    base: "/users",
    BY_ID: (id: number) => `/users/${id}`,
  },
});
