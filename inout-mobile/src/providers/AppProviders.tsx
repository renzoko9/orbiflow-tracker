import { useEffect, type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { setAuthFailureHandler, queryClient } from "@/shared/api";
import { ThemeProvider } from "@/shared/theme";
import { useAuthStore } from "@/shared/auth";
import { DEFAULT_CURRENCY } from "@/shared/i18n";
import { ToastHost, ErrorBoundary } from "@/shared/ui";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Composicion de todos los providers globales.
 * Mantener el orden: GestureHandler > SafeArea > Theme > QueryClient > BottomSheet > ErrorBoundary > children.
 *
 * El handler de auth-failure se registra aqui para evitar import circular
 * entre el http-client y el auth store.
 */
export function AppProviders({ children }: AppProvidersProps) {
  // formatCurrency lee la moneda activa de forma no-reactiva. Remontamos el
  // arbol de rutas con este key (debajo del QueryClientProvider para conservar
  // la cache) para que un cambio de moneda reformatee todo el dinero a la vez.
  const currency = useAuthStore((s) => s.user?.currency) ?? DEFAULT_CURRENCY;

  useEffect(() => {
    setAuthFailureHandler(() => {
      useAuthStore.getState().reset();
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              <ErrorBoundary key={currency}>{children}</ErrorBoundary>
              <ToastHost />
            </BottomSheetModalProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
