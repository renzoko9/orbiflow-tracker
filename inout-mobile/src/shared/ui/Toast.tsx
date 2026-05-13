import RNToast, {
  BaseToast,
  ErrorToast,
  type BaseToastProps,
  type ToastShowParams,
} from "react-native-toast-message";
import { lightTokens } from "@/shared/theme";

/**
 * Configuracion del Toast.
 * Llamar `showToast(...)` desde cualquier parte de la app.
 * Montar `<ToastHost />` una sola vez en el root layout.
 */

const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: lightTokens.success, backgroundColor: lightTokens.surface }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{ fontSize: 15, fontWeight: "600", color: lightTokens.textPrimary }}
      text2Style={{ fontSize: 13, color: lightTokens.textSecondary }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: lightTokens.danger, backgroundColor: lightTokens.surface }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{ fontSize: 15, fontWeight: "600", color: lightTokens.textPrimary }}
      text2Style={{ fontSize: 13, color: lightTokens.textSecondary }}
    />
  ),
  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: lightTokens.info, backgroundColor: lightTokens.surface }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{ fontSize: 15, fontWeight: "600", color: lightTokens.textPrimary }}
      text2Style={{ fontSize: 13, color: lightTokens.textSecondary }}
    />
  ),
};

export function ToastHost() {
  return <RNToast config={toastConfig} topOffset={60} />;
}

interface ShowToastParams {
  type: "success" | "error" | "info";
  text1: string;
  text2?: string;
}

export function showToast(params: ShowToastParams): void {
  RNToast.show({
    type: params.type,
    text1: params.text1,
    text2: params.text2,
    position: "top",
    visibilityTime: 3500,
  } satisfies ToastShowParams);
}
