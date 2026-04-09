import { useState, useEffect, useCallback } from "react";
import {
  TransactionListResponse,
  FilterTransactionsParams,
} from "@/src/core/dto/transaction.interface";
import TransactionService from "@/src/core/services/transaction.service";

export function useTransactions(filters?: FilterTransactionsParams) {
  const [transactions, setTransactions] = useState<TransactionListResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TransactionService.findAll(filters);
      setTransactions(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar movimientos",
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}
