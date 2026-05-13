import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import { type ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const containerVariants: Record<Variant, string> = {
  primary: "bg-brand active:bg-brandStrong",
  secondary: "bg-accent active:bg-accentStrong",
  outline: "bg-transparent border-2 border-brand active:bg-brandSoft",
  ghost: "bg-transparent active:bg-surfaceMuted",
  danger: "bg-danger active:bg-onDanger",
};

const textVariants: Record<Variant, string> = {
  primary: "text-onBrand",
  secondary: "text-onAccent",
  outline: "text-brand",
  ghost: "text-textPrimary",
  danger: "text-onDanger",
};

const containerSizes: Record<Size, string> = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-6 py-4",
};

const textSizes: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  fullWidth,
  className = "",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      className={[
        "rounded-xl flex-row items-center justify-center",
        containerVariants[variant],
        containerSizes[size],
        fullWidth ? "w-full" : "",
        isDisabled ? "opacity-60" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? "#1B2A5B" : "#fff"} />
      ) : (
        <Text className={`font-semibold ${textVariants[variant]} ${textSizes[size]}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
