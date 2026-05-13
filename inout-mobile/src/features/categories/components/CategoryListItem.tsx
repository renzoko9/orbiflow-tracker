import { Text, TouchableOpacity, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { getIconComponent } from "@/shared/utils";

interface CategoryListItemProps {
  name: string;
  icon: string;
  color: string;
  isGlobal: boolean;
  onPress: () => void;
}

export function CategoryListItem({
  name,
  icon,
  color,
  isGlobal,
  onPress,
}: CategoryListItemProps) {
  const tokens = useThemeTokens();
  const Icon = getIconComponent(icon);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-1 px-4 py-3"
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: color + "25" }}
      >
        <Icon size={20} color={color} />
      </View>

      <View className="flex-1 flex-row justify-between items-center gap-2">
        <Text
          className="text-base font-medium text-textPrimary"
          numberOfLines={1}
        >
          {name}
        </Text>
        {isGlobal && (
          <View className="bg-brandSoft rounded-md px-2 py-0.5 mr-3">
            <Text className="text-[10px] text-brand font-medium">
              Predeterminada
            </Text>
          </View>
        )}
      </View>

      <ChevronRight size={18} color={tokens.textSecondary} />
    </TouchableOpacity>
  );
}
