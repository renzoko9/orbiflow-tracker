import { create } from 'zustand';
import { Transaction } from '@domain/entities/Transaction';

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [...state.transactions, transaction] })),
  updateTransaction: (transaction) =>
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === transaction.id ? transaction : t)),
    })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
