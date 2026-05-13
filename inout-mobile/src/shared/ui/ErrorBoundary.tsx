import { Component, type ErrorInfo, type ReactNode } from "react";
import { View, Text } from "react-native";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

/**
 * Error boundary basico. Atrapa errores de render del subarbol.
 * Para reportar a un servicio (Sentry), interceptar en componentDidCatch.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
      console.error("[ErrorBoundary]", error, info);
    }
  }

  reset = (): void => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <View className="flex-1 items-center justify-center bg-background px-6 gap-4">
        <Text className="text-xl font-bold text-textPrimary">Algo salio mal</Text>
        <Text className="text-sm text-textSecondary text-center">
          {this.state.error.message}
        </Text>
        <Button onPress={this.reset} variant="outline">
          Reintentar
        </Button>
      </View>
    );
  }
}
