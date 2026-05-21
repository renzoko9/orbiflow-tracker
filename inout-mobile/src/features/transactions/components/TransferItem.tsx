import { Text, View } from "react-native";
import { ArrowRight, ArrowLeftRight } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency } from "@/shared/i18n";

interface TransferItemProps {
  amount: number;
  description: string;
  sourceAccountName: string;
  destinationAccountName: string;
}

const tabular = { fontVariant: ["tabular-nums" as const] };

export function TransferItem({
  amount,
  description,
  sourceAccountName,
  destinationAccountName,
}: TransferItemProps) {
  const tokens = useThemeTokens();
  const hasDescription = description?.trim().length > 0;
  const label = hasDescription ? description : "Transferencia";

  return (
    <View className="flex-row items-center py-3.5 px-4 bg-background">
      <View
        className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
        style={{ backgroundColor: tokens.brand + "1F" }}
      >
        <ArrowLeftRight size={20} color={tokens.brand} />
      </View>

      <View className="flex-1 mr-3">
        <Text
          className="text-[15px] font-sans-medium text-textPrimary"
          numberOfLines={1}
        >
          {label}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text
            className="text-[10px] uppercase text-textTertiary"
            numberOfLines={1}
            style={{ letterSpacing: 0.4 }}
          >
            {sourceAccountName}
          </Text>
          <ArrowRight
            size={10}
            color={tokens.textTertiary}
            style={{ marginHorizontal: 4 }}
          />
          <Text
            className="text-[10px] uppercase text-textTertiary"
            numberOfLines={1}
            style={{ letterSpacing: 0.4 }}
          >
            {destinationAccountName}
          </Text>
        </View>
      </View>

      <Text
        className="text-[17px] font-display-bold text-textPrimary"
        style={tabular}
      >
        {formatCurrency(amount)}
      </Text>
    </View>
  );
}
