import { Pressable, Text, ActivityIndicator } from "react-native";
import { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary-6 active:bg-primary-7",
  secondary: "bg-secondary-first-medium active:bg-secondary-first-hard",
  outline: "border-2 border-primary-6 bg-transparent active:bg-primary-1",
  ghost: "bg-transparent active:bg-gray-100",
};

const textVariantStyles: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-white",
  outline: "text-primary-6",
  ghost: "text-gray-700",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-6 py-4",
};

const textSizeStyles: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        rounded-lg flex-row items-center justify-center
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? "opacity-50" : ""}
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost" ? "#476464" : "#fff"
          }
        />
      ) : (
        <Text
          className={`font-semibold ${textVariantStyles[variant]} ${textSizeStyles[size]}`}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
