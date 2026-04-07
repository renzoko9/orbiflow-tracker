import { useState, useEffect, useCallback } from "react";
import { Account } from "@/src/core/dto/account.interface";
import AccountService from "@/src/core/services/account.service";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AccountService.findAll();
      setAccounts(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar cuentas",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, loading, error, refetch: fetchAccounts };
}
