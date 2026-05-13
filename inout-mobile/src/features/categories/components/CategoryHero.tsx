import { Text, View } from "react-native";
import { getIconComponent } from "@/shared/utils";
import { CategoryType } from "../model";

interface CategoryHeroProps {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isGlobal: boolean;
}

export function CategoryHero({
  name,
  type,
  icon,
  color,
  isGlobal,
}: CategoryHeroProps) {
  const Icon = getIconComponent(icon);
  const typeLabel = type === CategoryType.INCOME ? "Ingreso" : "Gasto";

  return (
    <View className="items-center px-4 pt-4 pb-6">
      <View
        className="w-20 h-20 rounded-2xl items-center justify-center mb-4"
        style={{ backgroundColor: color + "25" }}
      >
        <Icon size={40} color={color} />
      </View>

      <Text className="text-xl font-bold text-textPrimary text-center">
        {name}
      </Text>
      <Text className="text-sm text-textSecondary mt-1">{typeLabel}</Text>

      {isGlobal && (
        <View className="bg-brandSoft rounded-full px-3 py-1 mt-3">
          <Text className="text-xs text-brand font-medium">Predeterminada</Text>
        </View>
      )}
    </View>
  );
}
