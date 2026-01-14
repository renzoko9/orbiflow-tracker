import { View, Text, Pressable } from 'react-native';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onPress?: () => void;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '', onPress }: CardProps) {
  const baseStyles = `bg-white rounded-lg border border-gray-200 ${className}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${baseStyles} active:bg-gray-50`}>
        {children}
      </Pressable>
    );
  }

  return <View className={baseStyles}>{children}</View>;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <View className={`p-4 ${className}`}>{children}</View>;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <Text className={`text-xl font-bold text-gray-900 ${className}`}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <Text className={`text-sm text-gray-500 mt-1 ${className}`}>
      {children}
    </Text>
  );
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <View className={`px-4 pb-4 ${className}`}>{children}</View>;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <View className={`px-4 pb-4 flex-row items-center gap-2 ${className}`}>
      {children}
    </View>
  );
}
