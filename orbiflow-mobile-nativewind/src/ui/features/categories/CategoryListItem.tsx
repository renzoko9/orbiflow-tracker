import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { getIconComponent } from "@/src/ui/utils/icon-map";

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
  const Icon = getIconComponent(icon);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3"
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: color + "25" }}
      >
        <Icon size={20} color={color} />
      </View>

      <View className="flex-1 flex-row items-center gap-2">
        <Text
          className="text-base font-medium text-text-light"
          numberOfLines={1}
        >
          {name}
        </Text>
        {isGlobal && (
          <View className="bg-primary-1 rounded-full px-2 py-0.5">
            <Text className="text-[10px] text-primary-7 font-medium">
              Predeterminada
            </Text>
          </View>
        )}
      </View>

      <ChevronRight size={18} color={colors.subordinary} />
    </TouchableOpacity>
  );
}
