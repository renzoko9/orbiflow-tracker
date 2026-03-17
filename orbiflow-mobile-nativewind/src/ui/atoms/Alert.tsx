import { View, Text } from "react-native";
import {
  AlertCircle,
  CheckCircle,
  Info,
  TriangleAlert,
  LucideIcon,
} from "lucide-react-native";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  className?: string;
}

interface VariantStyle {
  container: string;
  textTitle: string;
  textMessage: string;
  Icon: LucideIcon;
  iconColor: string;
}

const variantStyles: Record<AlertVariant, VariantStyle> = {
  success: {
    container:
      "bg-success-soft border border-success-soft border-l-success-medium border-l-2",
    textTitle: "text-success-hard",
    textMessage: "text-success-hard",
    Icon: CheckCircle,
    iconColor: "#065f46",
  },
  error: {
    container:
      "bg-error-soft border border-error-soft border-l-error-medium border-l-2",
    textTitle: "text-error-hard",
    textMessage: "text-error-hard",
    Icon: AlertCircle,
    iconColor: "#991b1b",
  },
  warning: {
    container:
      "bg-warning-soft border border-warning-soft border-l-warning-medium border-l-2",
    textTitle: "text-warning-hard",
    textMessage: "text-warning-hard",
    Icon: TriangleAlert,
    iconColor: "#92400e",
  },
  info: {
    container:
      "bg-primary-1 border border-primary-1 border-l-primary-6 border-l-2",
    textTitle: "text-primary-8",
    textMessage: "text-primary-7",
    Icon: Info,
    iconColor: "#2f4343",
  },
};

export function Alert({
  variant = "info",
  title,
  message,
  className = "",
}: AlertProps) {
  const { container, textTitle, textMessage, Icon, iconColor } =
    variantStyles[variant];

  return (
    <View
      className={`rounded-lg px-4 py-3 flex-row gap-3 ${container} ${className}`}
    >
      <Icon size={18} color={iconColor} style={{ marginTop: 2 }} />
      <View className="flex-1">
        {title && (
          <Text className={`text-sm font-semibold mb-0.5 ${textTitle}`}>
            {title}
          </Text>
        )}
        <Text className={`text-sm ${textMessage}`}>{message}</Text>
      </View>
    </View>
  );
}
