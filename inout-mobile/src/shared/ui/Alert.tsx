import { View, Text } from "react-native";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
} from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";

type Variant = "error" | "success" | "info" | "warning";

interface AlertProps {
  variant: Variant;
  message: string;
  title?: string;
}

const containerByVariant: Record<Variant, string> = {
  error: "bg-dangerSoft border-danger",
  success: "bg-successSoft border-success",
  info: "bg-infoSoft border-info",
  warning: "bg-warningSoft border-warning",
};

const textByVariant: Record<Variant, string> = {
  error: "text-onDanger",
  success: "text-onSuccess",
  info: "text-onInfo",
  warning: "text-onWarning",
};

export function Alert({ variant, message, title }: AlertProps) {
  const tokens = useThemeTokens();
  const colorMap = {
    error: tokens.danger,
    success: tokens.success,
    info: tokens.info,
    warning: tokens.warning,
  };
  const Icon = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
    warning: TriangleAlert,
  }[variant];

  return (
    <View
      className={`flex-row items-start gap-3 rounded-xl border px-3 py-3 ${containerByVariant[variant]}`}
    >
      <Icon size={20} color={colorMap[variant]} />
      <View className="flex-1">
        {title ? (
          <Text className={`text-sm font-semibold ${textByVariant[variant]}`}>
            {title}
          </Text>
        ) : null}
        <Text className={`text-sm ${textByVariant[variant]}`}>{message}</Text>
      </View>
    </View>
  );
}
