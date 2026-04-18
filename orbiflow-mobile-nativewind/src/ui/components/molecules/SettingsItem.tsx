import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";

interface SettingsItemProps {
  icon: React.ReactNode;
  iconBackground?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  badge?: string;
  danger?: boolean;
  disabled?: boolean;
  showBorder?: boolean;
}

export function SettingsItem({
  icon,
  iconBackground = colors.primary[1],
  title,
  subtitle,
  onPress,
  rightElement,
  badge,
  danger = false,
  disabled = false,
  showBorder = true,
}: SettingsItemProps) {
  const titleColor = danger ? "text-error-medium" : "text-base-color";
  const Wrapper = onPress && !disabled ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.6}
      className={`flex-row items-center gap-3 px-4 py-3 ${
        showBorder ? "border-b border-primary-1" : ""
      } ${disabled ? "opacity-60" : ""}`}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 36, height: 36, backgroundColor: iconBackground }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className={`text-base font-medium ${titleColor}`}>{title}</Text>
        {subtitle && (
          <Text className="text-xs text-subordinary mt-0.5">{subtitle}</Text>
        )}
      </View>
      {badge && (
        <View className="bg-primary-1 px-2 py-0.5 rounded-full">
          <Text className="text-[10px] font-semibold text-primary-6 uppercase tracking-wide">
            {badge}
          </Text>
        </View>
      )}
      {rightElement ?? (onPress && !danger && (
        <ChevronRight size={18} color={colors.subordinary} />
      ))}
    </Wrapper>
  );
}
