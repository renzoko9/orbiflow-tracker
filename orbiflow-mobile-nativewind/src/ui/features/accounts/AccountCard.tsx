import { View, Text, TouchableOpacity } from "react-native";
import { getIconComponent } from "@/src/ui/utils/icon-map";

interface AccountCardProps {
  name: string;
  balance: string;
  description: string | null;
  icon: string;
  color: string;
  onPress?: () => void;
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

export function AccountCard({
  name,
  balance,
  description,
  icon,
  color,
  onPress,
}: AccountCardProps) {
  const Icon = getIconComponent(icon);
  const numericBalance = Number(balance);

  const Container: any = onPress ? TouchableOpacity : View;
  const containerProps = onPress
    ? { onPress, activeOpacity: 0.7 }
    : {};

  return (
    <Container
      className="rounded-2xl px-4 py-4 bg-background-light"
      style={cardShadow}
      {...containerProps}
    >
      <View className="flex-row items-center">
        <View
          className="w-11 h-11 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: color + "25" }}
        >
          <Icon size={22} color={color} />
        </View>

        <View className="flex-1 mr-3">
          <Text
            className="text-base font-semibold text-text-light"
            numberOfLines={1}
          >
            {name}
          </Text>
          {description ? (
            <Text className="text-sm text-subordinary mt-0.5" numberOfLines={1}>
              {description}
            </Text>
          ) : null}
        </View>

        <View className="items-end">
          <Text className="text-lg font-semibold text-text-light">
            S/ {numericBalance.toFixed(2)}
          </Text>
        </View>
      </View>
    </Container>
  );
}
