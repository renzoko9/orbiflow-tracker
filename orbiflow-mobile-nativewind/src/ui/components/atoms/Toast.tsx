import { View, Text } from "react-native";
import RNToast, {
  BaseToast,
  ToastShowParams,
  ToastConfig,
  ToastConfigParams,
} from "react-native-toast-message";
import type { ToastProps } from "react-native-toast-message";
import {
  CheckCircle,
  AlertCircle,
  TriangleAlert,
  Info,
  LucideIcon,
} from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";

interface VariantStyle {
  borderColor: string;
  backgroundColor: string;
  text1Color: string;
  text2Color: string;
  Icon: LucideIcon;
  iconColor: string;
}

const variantStyles: Record<string, VariantStyle> = {
  success: {
    borderColor: colors.success.medium,
    backgroundColor: colors.success.soft,
    text1Color: colors.success.hard,
    text2Color: colors.success.hard,
    Icon: CheckCircle,
    iconColor: colors.success.hard,
  },
  error: {
    borderColor: colors.error.medium,
    backgroundColor: colors.error.soft,
    text1Color: colors.error.hard,
    text2Color: colors.error.hard,
    Icon: AlertCircle,
    iconColor: colors.error.hard,
  },
  warning: {
    borderColor: colors.warning.medium,
    backgroundColor: colors.warning.soft,
    text1Color: colors.warning.hard,
    text2Color: colors.warning.hard,
    Icon: TriangleAlert,
    iconColor: colors.warning.hard,
  },
  info: {
    borderColor: colors.primary[6],
    backgroundColor: colors.primary[1],
    text1Color: colors.primary[8],
    text2Color: colors.primary[7],
    Icon: Info,
    iconColor: colors.primary[8],
  },
};

function renderToastVariant(variant: string) {
  return ({ text1, text2, onPress, ...rest }: ToastConfigParams<any>) => {
    const style = variantStyles[variant];
    const { Icon } = style;

    return (
      <BaseToast
        {...rest}
        text1={text1}
        text2={text2}
        onPress={onPress}
        style={{
          borderLeftColor: style.borderColor,
          borderLeftWidth: 4,
          backgroundColor: style.backgroundColor,
          borderRadius: 8,
          height: undefined,
          paddingVertical: 12,
        }}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        text1Style={{
          fontSize: 14,
          fontWeight: "600",
          color: style.text1Color,
        }}
        text2Style={{
          fontSize: 13,
          color: style.text2Color,
        }}
        text1NumberOfLines={2}
        text2NumberOfLines={3}
        renderLeadingIcon={() => (
          <View style={{ justifyContent: "center", paddingLeft: 12 }}>
            <Icon size={20} color={style.iconColor} />
          </View>
        )}
      />
    );
  };
}

const toastConfig: ToastConfig = {
  success: renderToastVariant("success"),
  error: renderToastVariant("error"),
  warning: renderToastVariant("warning"),
  info: renderToastVariant("info"),
};

export function Toast(props: Omit<ToastProps, "config">) {
  return <RNToast config={toastConfig} {...props} />;
}

export function showToast(params: ToastShowParams) {
  RNToast.show(params);
}

export function hideToast() {
  RNToast.hide();
}
