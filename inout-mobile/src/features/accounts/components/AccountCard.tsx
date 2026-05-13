import { Text, TouchableOpacity, View } from "react-native";
import { Card } from "@/shared/ui";
import { formatCurrency } from "@/shared/i18n";
import { getIconComponent } from "@/shared/utils";

interface AccountCardProps {
  name: string;
  balance: string;
  description: string | null;
  icon: string;
  color: string;
  onPress?: () => void;
}

export function AccountCard({
  name,
  balance,
  description,
  icon,
  color,
  onPress,
}: AccountCardProps) {
  const Icon = getIconComponent(icon);

  const content = (
    <View className="flex-row items-center">
      <View
        className="w-11 h-11 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: color + "25" }}
      >
        <Icon size={22} color={color} />
      </View>

      <View className="flex-1 mr-3">
        <Text
          className="text-base font-semibold text-textPrimary"
          numberOfLines={1}
        >
          {name}
        </Text>
        {description ? (
          <Text
            className="text-sm text-textSecondary mt-0.5"
            numberOfLines={1}
          >
            {description}
          </Text>
        ) : null}
      </View>

      <Text className="text-lg font-semibold text-textPrimary">
        {formatCurrency(balance)}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card>{content}</Card>
      </TouchableOpacity>
    );
  }

  return <Card>{content}</Card>;
}
