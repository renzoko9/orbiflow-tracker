import { View, Text } from "react-native";
import { CategoryType } from "@/src/core/enums/category-type.enum";
import { getIconComponent } from "@/src/ui/utils/icon-map";

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

      <Text className="text-xl font-bold text-base-color text-center">
        {name}
      </Text>
      <Text className="text-sm text-subordinary mt-1">{typeLabel}</Text>

      {isGlobal && (
        <View className="bg-primary-1 rounded-full px-3 py-1 mt-3">
          <Text className="text-xs text-primary-7 font-medium">
            Predeterminada
          </Text>
        </View>
      )}
    </View>
  );
}
