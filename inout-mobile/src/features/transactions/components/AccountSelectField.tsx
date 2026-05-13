import { useRef } from "react";
import { Wallet } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import {
  BottomSheet,
  SelectField,
  type BottomSheetModal,
} from "@/shared/ui";
import { AccountPicker, type Account } from "@/features/accounts";

interface AccountSelectFieldProps {
  accounts: Account[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  error?: string;
}

export function AccountSelectField({
  accounts,
  selectedId,
  onSelect,
  error,
}: AccountSelectFieldProps) {
  const tokens = useThemeTokens();
  const sheetRef = useRef<BottomSheetModal>(null);
  const selected = accounts.find((a) => a.id === selectedId);

  return (
    <>
      <SelectField
        icon={<Wallet size={18} color={tokens.textTertiary} />}
        label={selected?.name}
        placeholder="Selecciona una cuenta"
        error={error}
        onPress={() => sheetRef.current?.present()}
      />
      <BottomSheet ref={sheetRef} snapPoints={["60%"]}>
        <AccountPicker
          accounts={accounts}
          selectedId={selectedId}
          onSelect={(id) => {
            onSelect(id);
            sheetRef.current?.dismiss();
          }}
        />
      </BottomSheet>
    </>
  );
}
