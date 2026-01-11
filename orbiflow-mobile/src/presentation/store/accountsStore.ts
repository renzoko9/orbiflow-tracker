import { create } from 'zustand';
import { Account } from '@domain/entities/Account';

interface AccountsState {
  accounts: Account[];
  selectedAccount: Account | null;
  isLoading: boolean;
  error: string | null;
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  removeAccount: (id: number) => void;
  setSelectedAccount: (account: Account | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAccountsStore = create<AccountsState>((set) => ({
  accounts: [],
  selectedAccount: null,
  isLoading: false,
  error: null,
  setAccounts: (accounts) => set({ accounts }),
  addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
  updateAccount: (account) =>
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === account.id ? account : a)),
    })),
  removeAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
    })),
  setSelectedAccount: (selectedAccount) => set({ selectedAccount }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
