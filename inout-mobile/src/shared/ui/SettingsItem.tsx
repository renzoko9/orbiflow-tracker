import { type ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { cn } from "@/shared/utils";

interface SettingsItemProps {
  icon: ReactNode;
  iconBackground?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: ReactNode;
  badge?: string;
  danger?: boolean;
  disabled?: boolean;
  showBorder?: boolean;
}

export function SettingsItem({
  icon,
  iconBackground,
  title,
  subtitle,
  onPress,
  rightElement,
  badge,
  danger = false,
  disabled = false,
  showBorder = true,
}: SettingsItemProps) {
  const tokens = useThemeTokens();
  const Wrapper = onPress && !disabled ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.6}
      className={cn(
        "flex-row items-center gap-3 px-4 py-3",
        showBorder && "border-b border-border",
        disabled && "opacity-60",
      )}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 36,
          height: 36,
          backgroundColor: iconBackground ?? tokens.surfaceMuted,
        }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className={cn(
            "text-base font-medium",
            danger ? "text-danger" : "text-textPrimary",
          )}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-xs text-textTertiary mt-0.5">{subtitle}</Text>
        ) : null}
      </View>
      {badge ? (
        <View className="bg-surfaceMuted px-2 py-0.5 rounded-full">
          <Text className="text-[10px] font-semibold text-textSecondary uppercase tracking-wide">
            {badge}
          </Text>
        </View>
      ) : null}
      {rightElement ??
        (onPress && !danger ? (
          <ChevronRight size={18} color={tokens.textTertiary} />
        ) : null)}
    </Wrapper>
  );
}
