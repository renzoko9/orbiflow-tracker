import { Wallet } from "lucide-react-native";
import { AccountPicker } from "@/src/ui/features/accounts/AccountPicker";
import { Account } from "@/src/core/dto/account.interface";
import { SelectBottomSheet } from "./SelectBottomSheet";

interface AccountSelectFieldProps {
  accounts: Account[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  error?: string;
  className?: string;
}

export function AccountSelectField({
  accounts,
  selectedId,
  onSelect,
  error,
  className,
}: AccountSelectFieldProps) {
  const selectedAccount = accounts.find((a) => a.id === selectedId) ?? null;

  return (
    <SelectBottomSheet
      icon={Wallet}
      label={selectedAccount?.name}
      placeholder="Selecciona una cuenta"
      secondaryText={
        selectedAccount
          ? `S/ ${Number(selectedAccount.balance).toFixed(2)}`
          : undefined
      }
      error={error}
      className={className}
    >
      {(dismiss) => (
        <AccountPicker
          accounts={accounts}
          selectedId={selectedId}
          onSelect={(id) => {
            onSelect(id);
            dismiss();
          }}
        />
      )}
    </SelectBottomSheet>
  );
}
