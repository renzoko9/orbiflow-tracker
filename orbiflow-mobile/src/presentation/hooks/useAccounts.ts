import { useEffect, useState } from 'react';
import { GetAccountsUseCase } from '@domain/use-cases/account/GetAccounts';
import { CreateAccountUseCase } from '@domain/use-cases/account/CreateAccount';
import { UpdateAccountUseCase } from '@domain/use-cases/account/UpdateAccount';
import { DeleteAccountUseCase } from '@domain/use-cases/account/DeleteAccount';
import { AccountRepository } from '@data/repositories/AccountRepository';
import { useAccountsStore } from '../store/accountsStore';
import { Account } from '@domain/entities/Account';

const accountRepository = new AccountRepository();

export const useAccounts = () => {
  const { accounts, isLoading, error, setAccounts, addAccount, updateAccount: updateInStore, removeAccount, setLoading, setError } = useAccountsStore();
  const [initialized, setInitialized] = useState(false);

  const getAccountsUseCase = new GetAccountsUseCase(accountRepository);
  const createAccountUseCase = new CreateAccountUseCase(accountRepository);
  const updateAccountUseCase = new UpdateAccountUseCase(accountRepository);
  const deleteAccountUseCase = new DeleteAccountUseCase(accountRepository);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccountsUseCase.execute();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cuentas');
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (
    name: string,
    balance?: number,
    description?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const newAccount = await createAccountUseCase.execute(name, balance, description);
      addAccount(newAccount);
      return newAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cuenta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (id: number, data: Partial<Account>) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateAccountUseCase.execute(id, data);
      updateInStore(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cuenta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: number) => {
    try {
      setLoading(true);
      await deleteAccountUseCase.execute(id);
      removeAccount(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cuenta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) {
      fetchAccounts();
      setInitialized(true);
    }
  }, [initialized]);

  return {
    accounts,
    loading: isLoading,
    error,
    refetch: fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
};
